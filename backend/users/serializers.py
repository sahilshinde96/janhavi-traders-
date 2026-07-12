from rest_framework import serializers
from .models import User, UserProfile, UserAddress


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['name', 'avatar']


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = ['id', 'label', 'name', 'phone', 'line1', 'line2',
                  'city', 'state', 'pincode', 'latitude', 'longitude', 'is_default']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'is_verified',
                  'is_staff', 'date_joined', 'profile', 'name']

    def get_name(self, obj):
        try:
            return obj.profile.name
        except Exception:
            return ''


class SendOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=255)
    type = serializers.ChoiceField(choices=['email', 'phone', 'whatsapp'])


class VerifyOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=255)
    type = serializers.ChoiceField(choices=['email', 'phone', 'whatsapp'])
    code = serializers.CharField(max_length=6, min_length=6)
