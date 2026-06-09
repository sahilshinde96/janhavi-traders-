import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-janhavi-traders-secret-key-change-in-prod-2024')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'cloudinary',
    'cloudinary_storage',
    # Local apps
    'users',
    'products',
    'cart',
    'orders',
    'shipments',
    'discounts',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'janhavi_backend.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

WSGI_APPLICATION = 'janhavi_backend.wsgi.application'

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    # Default pagination class and page size for list views (e.g. products, orders).
    # Change 'PAGE_SIZE' value if you want more or fewer items loaded per API call page.
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# --- JSON Web Token Authentication Configurations ---
# Modify ACCESS_TOKEN_LIFETIME and REFRESH_TOKEN_LIFETIME to set session/token expiry.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
}

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
# If you want to restrict which websites can send requests to this backend,
# set CORS_ALLOW_ALL_ORIGINS = False and define CORS_ALLOWED_ORIGINS list.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# --- Static Assets (CSS, JS, Admin styling) serve configuration ---
# Whitenoise is used here to host collected static assets directly from Django in production.
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- Media Files (User-uploaded assets) serve configuration ---
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Cloudinary CDN Configuration ---
# Used for storing category/product media assets in production.
# Provide CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET in .env for production.
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': config('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
}

# --- Business Logic Variables ---
# Change this value to adjust the OTP validity duration (in minutes).
EMAIL_OTP_EXPIRY_MINUTES = 10
OTP_EXPIRY_MINUTES = 10

# Default email sender name and address shown in transactional emails.
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Janhavi Traders <noreply@janhavitraders.com>')

# Third-party service API keys loaded from environment variables
RESEND_API_KEY = config('RESEND_API_KEY', default='')
BREVO_API_KEY = config('BREVO_API_KEY', default='')
FAST2SMS_API_KEY = config('FAST2SMS_API_KEY', default='')

