from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import random
import string
from datetime import timedelta
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email=None, phone=None, **extra_fields):
        if not email and not phone:
            raise ValueError('Email or phone is required')
        if email:
            email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        for key, value in extra_fields.items():
            setattr(user, key, value)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email or self.phone or f'User {self.id}'


class OTP(models.Model):
    identifier = models.CharField(max_length=255)  # email or phone
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def is_valid(self):
        # Validate if OTP code has expired or was already used (BUG-07 fix).
        # We dynamicize expiration by reading OTP_EXPIRY_MINUTES from Django settings,
        # fallback to 10 minutes if not present. This prevents hardcoding expiry.
        from django.conf import settings
        expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        return not self.is_used and timezone.now() < self.created_at + timedelta(minutes=expiry_minutes)


    @classmethod
    def generate_code(cls):
        return ''.join(random.choices(string.digits, k=6))

    def __str__(self):
        return f'OTP({self.identifier}, used={self.is_used})'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=100, blank=True)
    avatar = models.URLField(blank=True)

    def __str__(self):
        return f'{self.user} - Profile'


class UserAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Home')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user} - {self.label}'
