from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings

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
        print(f"\n[EMAIL] [SMTP] Email sent successfully to {recipient_list[0]}!\n", flush=True)
        logger.info(f"[EMAIL] [SMTP] Email sent successfully to {recipient_list[0]}!")
    except Exception as e:
        # If sending fails (e.g. SMTP timeout, auth error, port blocked), log it
        print(f"\n[EMAIL] [DEV] (SMTP Failed: {e}) OTP for {recipient_list[0]}: {code}\n", flush=True)
        logger.error(f"[EMAIL] [DEV] (SMTP Failed: {e}) OTP for {recipient_list[0]}: {code}")

def send_otp_sms_async(identifier, code):
    fast2sms_key = getattr(settings, 'FAST2SMS_API_KEY', '')
    if not fast2sms_key:
        logger.warning("[SMS] [Fast2SMS] No API Key configured.")
        print("[SMS] [Fast2SMS] No API Key configured.", flush=True)
        return
    
    cleaned_number = normalize_phone(identifier)
    print(f"\n[SMS] [Fast2SMS] Attempting to send OTP {code} to {cleaned_number}...\n", flush=True)
    logger.info(f"[SMS] [Fast2SMS] Attempting to send OTP {code} to {cleaned_number}...")

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "otp",
            "variables_values": str(code),
            "numbers": cleaned_number,
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                "authorization": fast2sms_key,
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            res_data = json.loads(res_body)
            if res_data.get('return') is True:
                success_msg = f"[SMS] [Fast2SMS] Sent successfully to {cleaned_number}! Message: {res_data.get('message')}"
                print(f"\n{success_msg}\n", flush=True)
                logger.info(success_msg)
            else:
                fail_msg = f"[SMS] [Fast2SMS] Send failed to {cleaned_number}: {res_data.get('message')} (Response: {res_body})"
                print(f"\n{fail_msg}\n", flush=True)
                logger.error(fail_msg)
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode('utf-8')
            err_msg = f"[SMS] [Fast2SMS] HTTP Error {e.code} sending SMS to {cleaned_number}: {err_body}"
        except Exception:
            err_msg = f"[SMS] [Fast2SMS] HTTP Error {e.code} sending SMS to {cleaned_number} (Could not read body)"
        print(f"\n{err_msg}\n", flush=True)
        logger.error(err_msg)
    except Exception as e:
        err_msg = f"[SMS] [Fast2SMS] Failed to send SMS to {identifier}: {e}"
        print(f"\n{err_msg}\n", flush=True)
        logger.error(err_msg)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

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
            
            subject = 'Your Janhavi Traders OTP'
            message = (
                f'Hello,\n\n'
                f'Your one-time password for Janhavi Traders is:\n\n'
                f'  {code}\n\n'
                f'This OTP is valid for {settings.OTP_EXPIRY_MINUTES} minutes.\n'
                f'Do not share this with anyone.\n\n'
                f'— Team Janhavi Traders'
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
                # Also print to logs immediately as backup
                print(f'\n[EMAIL] [DEV] (SMTP/HTTPS Triggered) OTP for {identifier}: {code}\n', flush=True)
                logger.info(f"[EMAIL] [DEV] (SMTP/HTTPS Triggered) OTP for {identifier}: {code}")
            else:
                # Fallback to console print if SMTP/HTTPS is not configured in environment
                print(f'\n[EMAIL] [DEV] (No SMTP/HTTPS Configured) OTP for {identifier}: {code}\n', flush=True)
                logger.info(f"[EMAIL] [DEV] (No SMTP/HTTPS Configured) OTP for {identifier}: {code}")

        else:
            fast2sms_key = getattr(settings, 'FAST2SMS_API_KEY', '')
            if fast2sms_key:
                threading.Thread(
                    target=send_otp_sms_async,
                    args=(identifier, code),
                    daemon=True
                ).start()
                print(f'\n[SMS] [DEV] (Fast2SMS Triggered) OTP for {identifier}: {code}\n', flush=True)
                logger.info(f"[SMS] [DEV] (Fast2SMS Triggered) OTP for {identifier}: {code}")
            else:
                print(f'\n[SMS] [DEV] (No SMS Configured) OTP for {identifier}: {code}\n', flush=True)
                logger.warning(f"[SMS] [DEV] (No SMS Configured) OTP for {identifier}: {code}")

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
