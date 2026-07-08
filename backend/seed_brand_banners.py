import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'janhavi_backend.settings')
django.setup()

from products.models import BrandBanner

def seed_banners():
    print("Clearing old brand banners...")
    BrandBanner.objects.all().delete()

    banners = [
        {"name": "Good Vibes", "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", "link_url": "/products?search=Good+Vibes", "sort_order": 1},
        {"name": "Nivea", "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", "link_url": "/products?search=Nivea", "sort_order": 2},
        {"name": "NY Bae", "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", "link_url": "/products?search=NY+Bae", "sort_order": 3},
        {"name": "The Derma Co", "image_url": "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600", "link_url": "/products?search=Derma", "sort_order": 4},
        {"name": "DermDoc", "image_url": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "link_url": "/products?search=DermDoc", "sort_order": 5},
        {"name": "Lakme", "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600", "link_url": "/products?search=Lakme", "sort_order": 6},
        {"name": "Alps Goodness", "image_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600", "link_url": "/products?search=Alps", "sort_order": 7},
        {"name": "Swiss Beauty", "image_url": "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600", "link_url": "/products?search=Swiss", "sort_order": 8},
    ]

    for b in banners:
        banner = BrandBanner.objects.create(**b)
        print(f"Created brand banner: {banner.name}")

    print("Brand banners seeding completed successfully!")

if __name__ == "__main__":
    seed_banners()
