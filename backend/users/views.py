from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics, throttling
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.conf import settings as django_settings

from .models import User, OTP, UserProfile, UserAddress
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer,
    UserSerializer, UserAddressSerializer
)

import threading
import urllib.request
import urllib.error
import json
import logging

logger = logging.getLogger(__name__)

def normalize_phone(phone_str):
    """Normalize Indian phone numbers to a standard 10-digit format."""
    cleaned = ''.join(c for c in phone_str if c.isdigit())
    if len(cleaned) == 12 and cleaned.startswith('91'):
        cleaned = cleaned[2:]
    elif len(cleaned) == 11 and cleaned.startswith('0'):
        cleaned = cleaned[1:]
    return cleaned

def send_otp_email_async(subject, message, from_email, recipient_list, code):
    try:
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"[EMAIL] [SMTP] Email sent successfully to {recipient_list[0]}!")
    except Exception as e:
        # If sending fails (e.g. SMTP timeout, auth error, port blocked), log it
        logger.error(f"[EMAIL] [SMTP] Failed to send email to {recipient_list[0]}: {e}")
        # Only print the OTP code to terminal/logs in debug/development mode (BUG-02 fix).
        # This prevents credentials leaking in production logs.
        if django_settings.DEBUG:
            print(f"\n[EMAIL] [DEV] (SMTP Failed: {e}) OTP for {recipient_list[0]}: {code}\n", flush=True)

def send_otp_sms_async(identifier, code):
    blacksms_key = getattr(settings, 'BLACKSMS_API_KEY', '')
    sender_id = getattr(settings, 'BLACKSMS_SENDER_ID', '')
    dlt_template_id = getattr(settings, 'BLACKSMS_DLT_TEMPLATE_ID', '')

    if not blacksms_key:
        logger.warning("[SMS] [BlackSMS] No API Key configured.")
        if django_settings.DEBUG:
            print("[SMS] [BlackSMS] No API Key configured.", flush=True)
        return
    
    cleaned_number = normalize_phone(identifier)
    logger.info(f"[SMS] [BlackSMS] Attempting to send OTP to {cleaned_number}...")
    if django_settings.DEBUG:
        print(f"\n[SMS] [BlackSMS] Attempting to send OTP {code} to {cleaned_number}...\n", flush=True)

    try:
        url = "https://www.blacksms.in/sms"
        payload = {
            "sender_id": sender_id,
            "variables_values": str(code),
            "numbers": cleaned_number,
        }
        if dlt_template_id:
            payload["dlt_template_id"] = dlt_template_id

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                "Authorization": blacksms_key,
                "Content-Type": "application/json",
                "accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            res_data = json.loads(res_body)
            if res_data.get('return') is True or res_data.get('status') == 'success' or res_data.get('status_code') == 200:
                success_msg = f"[SMS] [BlackSMS] Sent successfully to {cleaned_number}!"
                logger.info(success_msg)
            else:
                fail_msg = f"[SMS] [BlackSMS] Send failed to {cleaned_number}: {res_body}"
                logger.error(fail_msg)
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode('utf-8')
            err_msg = f"[SMS] [BlackSMS] HTTP Error {e.code} sending SMS to {cleaned_number}: {err_body}"
        except Exception:
            err_msg = f"[SMS] [BlackSMS] HTTP Error {e.code} sending SMS to {cleaned_number}"
        logger.error(err_msg)
    except Exception as e:
        err_msg = f"[SMS] [BlackSMS] Failed to send SMS to {identifier}: {e}"
        print(f"\n{err_msg}\n", flush=True)
        logger.error(err_msg)



# Custom rate throttle for OTP requests to prevent brute force or financial/resource abuse (BUG-04 fix).
# Limits requests per IP based on the 'otp' key rate configured under DEFAULT_THROTTLE_RATES in settings.
class OTPRateThrottle(throttling.AnonRateThrottle):
    """Limits OTP requests to 3 per minute per IP to prevent brute-force and SMS/email abuse."""
    scope = 'otp'

# View for initiating standard User OTP login.
# Applies OTPRateThrottle to prevent email/SMS bombardment.
class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRateThrottle]


    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        identifier = serializer.validated_data['identifier'].strip().lower()
        otp_type = serializer.validated_data['type']

        if otp_type == 'phone':
            identifier = normalize_phone(identifier)
            if len(identifier) != 10 or not identifier.isdigit():
                return Response({'error': 'Please enter a valid 10-digit Indian phone number.'}, status=400)

        # Invalidate old OTPs
        OTP.objects.filter(identifier=identifier, is_used=False).update(is_used=True)

        # Generate new OTP
        code = OTP.generate_code()
        OTP.objects.create(identifier=identifier, code=code)

        if otp_type == 'email':
            # Check if SMTP credentials or HTTPS API keys are configured
            email_user = getattr(settings, 'EMAIL_HOST_USER', '')
            email_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
            resend_key = getattr(settings, 'RESEND_API_KEY', '')
            brevo_key = getattr(settings, 'BREVO_API_KEY', '')
            has_credentials = (email_user and email_password) or resend_key or brevo_key
            
            subject = 'Your BLUSHH OTP'
            message = (
                f'Hello,\n\n'
                f'Your one-time password for BLUSHH is:\n\n'
                f'  {code}\n\n'
                f'This OTP is valid for {settings.OTP_EXPIRY_MINUTES} minutes.\n'
                f'Do not share this with anyone.\n\n'
                f'— Team BLUSHH'
            )
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [identifier]
            
            if has_credentials:
                # Run the sending connection in a background thread to prevent Gunicorn workers from hanging/timing out
                threading.Thread(
                    target=send_otp_email_async,
                    args=(subject, message, from_email, recipient_list, code),
                    daemon=True
                ).start()
                logger.info(f"[EMAIL] OTP email triggered for {identifier}")
                # Only print the generated code to the console/stdout in local development (DEBUG=True) (BUG-02 fix).
                # This avoids exposing temporary authentication codes in production environment logs.
                if django_settings.DEBUG:
                    print(f'\n[EMAIL] [DEV] OTP for {identifier}: {code}\n', flush=True)
            else:
                # Fallback to console print if SMTP/HTTPS is not configured in environment
                logger.warning(f"[EMAIL] No SMTP/HTTPS configured for {identifier}")
                # Only print the generated code to console/stdout in local development (BUG-02 fix).
                if django_settings.DEBUG:
                    print(f'\n[EMAIL] [DEV] (No SMTP/HTTPS Configured) OTP for {identifier}: {code}\n', flush=True)

        elif otp_type == 'phone':
            blacksms_key = getattr(settings, 'BLACKSMS_API_KEY', '')
            if blacksms_key:
                threading.Thread(
                    target=send_otp_sms_async,
                    args=(identifier, code),
                    daemon=True
                ).start()
                logger.info(f"[SMS] OTP SMS triggered for {identifier}")
                # Only print the generated code to local development terminal (BUG-02 fix).
                if django_settings.DEBUG:
                    print(f'\n[SMS] [DEV] OTP for {identifier}: {code}\n', flush=True)
            else:
                logger.warning(f"[SMS] No BlackSMS provider configured for {identifier}")
                # Only print the generated code to local development terminal (BUG-02 fix).
                if django_settings.DEBUG:
                    print(f'\n[SMS] [DEV] (No SMS Configured) OTP for {identifier}: {code}\n', flush=True)

        return Response({
            'message': f'OTP sent to {identifier}',
            'expires_in': f'{settings.OTP_EXPIRY_MINUTES} minutes',
        })


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        identifier = serializer.validated_data['identifier'].strip().lower()
        otp_type = serializer.validated_data['type']
        code = serializer.validated_data['code']

        if otp_type == 'phone':
            identifier = normalize_phone(identifier)

        # Development test backdoor
        is_backdoor = (code == "123456" and settings.DEBUG)

        if not is_backdoor:
            # Find latest valid OTP
            otp = OTP.objects.filter(
                identifier=identifier, code=code, is_used=False
            ).order_by('-created_at').first()

            if not otp or not otp.is_valid():
                return Response({'error': 'Invalid or expired OTP. Please request a new one.'}, status=400)

            otp.is_used = True
            otp.save(update_fields=['is_used'])

        # Get or create user
        if otp_type == 'email':
            user, created = User.objects.get_or_create(email=identifier)
        else:
            user, created = User.objects.get_or_create(phone=identifier)


        user.is_verified = True
        user.save(update_fields=['is_verified'])

        # Ensure profile exists
        UserProfile.objects.get_or_create(user=user)

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'is_new_user': created,
        })


class ProfileView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        name = request.data.get('name', '').strip()
        if name:
            profile.name = name
            profile.save(update_fields=['name'])
        return Response(UserSerializer(request.user).data)


class AddressListView(APIView):
    def get(self, request):
        addresses = UserAddress.objects.filter(user=request.user)
        return Response(UserAddressSerializer(addresses, many=True).data)

    def post(self, request):
        serializer = UserAddressSerializer(data=request.data)
        if serializer.is_valid():
            address = serializer.save(user=request.user)
            # First address becomes default automatically
            if not UserAddress.objects.filter(user=request.user).exclude(pk=address.pk).exists():
                address.is_default = True
                address.save(update_fields=['is_default'])
            return Response(UserAddressSerializer(address).data, status=201)
        return Response(serializer.errors, status=400)


class AddressDetailView(APIView):
    def get_object(self, request, pk):
        try:
            return UserAddress.objects.get(pk=pk, user=request.user)
        except UserAddress.DoesNotExist:
            return None

    def put(self, request, pk):
        address = self.get_object(request, pk)
        if not address:
            return Response({'error': 'Address not found'}, status=404)
        serializer = UserAddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        address = self.get_object(request, pk)
        if not address:
            return Response({'error': 'Address not found'}, status=404)
        address.delete()
        return Response(status=204)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(is_staff=False).order_by('-date_joined')


class GoogleSignInView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'Google credential is required.'}, status=400)

        # 1. Verify token with Google's public tokeninfo API
        try:
            google_verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
            req = urllib.request.Request(google_verify_url, method='GET')
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode('utf-8')
                payload = json.loads(res_body)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            logger.error(f"[GOOGLE] Verification failed. HTTP Error {e.code}: {err_body}")
            return Response({'error': 'Invalid Google credential token.'}, status=400)
        except Exception as e:
            logger.error(f"[GOOGLE] Connection error during token verification: {e}")
            return Response({'error': 'Failed to connect to Google authentication server.'}, status=500)

        # 2. Check audience claim to prevent token spoofing
        google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')
        if google_client_id:
            aud = payload.get('aud')
            if aud != google_client_id:
                logger.error(f"[GOOGLE] Token audience mismatch. Expected: {google_client_id}, Got: {aud}")
                return Response({'error': 'Token verification failed: Client ID mismatch.'}, status=400)
        else:
            logger.warning("[GOOGLE] GOOGLE_CLIENT_ID is not configured in settings. Skipping audience validation.")

        # 3. Retrieve user information from payload
        email = payload.get('email')
        if not email:
            return Response({'error': 'Email not provided by Google account.'}, status=400)

        name = payload.get('name', '').strip()
        picture = payload.get('picture', '')

        # 4. Get or create User
        user, created = User.objects.get_or_create(email=email)
        user.is_verified = True
        user.save(update_fields=['is_verified'])

        # 5. Create or update UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.name and name:
            profile.name = name
            profile.save(update_fields=['name'])
        if not profile.avatar and picture:
            profile.avatar = picture
            profile.save(update_fields=['avatar'])

        # 6. Generate simple JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'is_new_user': created,
        })

