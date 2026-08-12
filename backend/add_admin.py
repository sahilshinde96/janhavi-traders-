import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'janhavi_backend.settings')
django.setup()

from users.models import User

def add_admin(email, password=None):
    email = email.strip().lower()
    user, created = User.objects.get_or_create(email=email)
    user.is_staff = True
    user.is_superuser = True
    user.is_verified = True
    if password:
        user.set_password(password)
    user.save()
    status = "Created new" if created else "Updated existing"
    print(f"[SUCCESS] {status} user '{email}' as Admin (is_staff=True, is_superuser=True).")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python add_admin.py <email> [password]")
        sys.exit(1)
    
    target_email = sys.argv[1]
    pwd = sys.argv[2] if len(sys.argv) > 2 else None
    add_admin(target_email, pwd)
