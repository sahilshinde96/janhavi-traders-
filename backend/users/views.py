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


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        identifier = serializer.validated_data['identifier'].strip().lower()
        otp_type = serializer.validated_data['type']

        # Invalidate old OTPs
        OTP.objects.filter(identifier=identifier, is_used=False).update(is_used=True)

        # Generate new OTP
        code = OTP.generate_code()
        OTP.objects.create(identifier=identifier, code=code)

        if otp_type == 'email':
            try:
                send_mail(
                    subject='Your Janhavi Traders OTP',
                    message=(
                        f'Hello,\n\n'
                        f'Your one-time password for Janhavi Traders is:\n\n'
                        f'  {code}\n\n'
                        f'This OTP is valid for {settings.OTP_EXPIRY_MINUTES} minutes.\n'
                        f'Do not share this with anyone.\n\n'
                        f'— Team Janhavi Traders'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[identifier],
                    fail_silently=False,
                )
            except Exception as e:
                # In development, OTP is printed to console
                print(f'\n[EMAIL] [DEV] OTP for {identifier}: {code}\n')

        else:
            # SMS: log to console (integrate Fast2SMS/Twilio in production)
            print(f'\n[SMS] [DEV] OTP for {identifier}: {code}\n')

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
