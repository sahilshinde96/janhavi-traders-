from .base import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default=''),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

EMAIL_BACKEND = 'janhavi_backend.email_backends.HTTPSEmailBackend'
RESEND_API_KEY = config('RESEND_API_KEY', default='')
BREVO_API_KEY = config('BREVO_API_KEY', default='')
FAST2SMS_API_KEY = config('FAST2SMS_API_KEY', default='')
BLACKSMS_API_KEY = config('BLACKSMS_API_KEY', default='')
BLACKSMS_SENDER_ID = config('BLACKSMS_SENDER_ID', default='')
BLACKSMS_DLT_TEMPLATE_ID = config('BLACKSMS_DLT_TEMPLATE_ID', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='BLUSHH <noreply@blushh.online>')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Cloudinary for media storage in production
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
