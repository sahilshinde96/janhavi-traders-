import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'janhavi_backend.settings')
django.setup()

from products.models import Category, Product, ProductImage
from discounts.models import Coupon
from django.utils import timezone

def seed_database():
    print("Clearing old products, images, and coupons...")
    ProductImage.objects.all().delete()
    Product.objects.all().delete()
    Coupon.objects.all().delete()

    # Get or create categories
    makeup, _ = Category.objects.get_or_create(
        name="Makeup",
        defaults={
            "description": "Premium cosmetic products for face, eyes, and lips.",
            "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=60",
            "is_active": True,
            "sort_order": 1
        }
    )
    skincare, _ = Category.objects.get_or_create(
        name="Skincare",
        defaults={
            "description": "Nourishing and hydrating products for a healthy, glowing complexion.",
            "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=60",
            "is_active": True,
            "sort_order": 2
        }
    )
    haircare, _ = Category.objects.get_or_create(
        name="Haircare",
        defaults={
            "description": "Essential care for strong, shiny, and beautiful hair.",
            "image": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=60",
            "is_active": True,
            "sort_order": 3
        }
    )

    print("Categories checked.")

    products_data = [
        # --- MAKEUP ---
        {
            "category": makeup,
            "name": "Velvet Matte Lipstick - Crimson Touch",
            "description": "Indulge in rich, creamy color with our Velvet Matte Lipstick. Formulated with hydrating vitamin E and jojoba oil, it delivers a comfortable, long-wearing matte finish without drying your lips.",
            "ingredients": "Octyldodecanol, Ricinus Communis (Castor) Seed Oil, Silica, Tricaprylyl Citrate, Ozonised Jojoba Oil, Vitamin E, Fragrance.",
            "how_to_use": "Apply directly to clean lips. For a more defined look, line lips with a matching lip liner before application.",
            "mrp": Decimal("799.00"),
            "offer_price": Decimal("599.00"),
            "stock_qty": 45,
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": makeup,
            "name": "Waterproof Liquid Eyeliner - Midnight Black",
            "description": "Achieve the perfect wing with our ultra-precise, smudge-proof liquid eyeliner. The fine felt-tip applicator glides on smoothly for bold, intense color that lasts all day.",
            "ingredients": "Water, Acrylates Copolymer, Butylene Glycol, Carbon Black, Phenoxyethanol, Ethylhexylglycerin.",
            "how_to_use": "Shake well. Draw a fine line along the upper lash line from the inner corner outward. Extend to create a wing if desired.",
            "mrp": Decimal("499.00"),
            "offer_price": Decimal("399.00"),
            "stock_qty": 60,
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1631214503005-3e28aa8ef4c1?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": makeup,
            "name": "Flawless Liquid Foundation",
            "description": "A lightweight, medium-to-full coverage foundation that blends seamlessly into the skin for a natural, soft-focus matte finish. Available in neutral undertones.",
            "ingredients": "Water, Cyclopentasiloxane, Glycerin, Dimethicone, Titanium Dioxide, Zinc Oxide, Iron Oxides.",
            "how_to_use": "Apply a small amount to the center of the face and blend outwards using a foundation brush or beauty sponge.",
            "mrp": Decimal("1199.00"),
            "offer_price": Decimal("899.00"),
            "stock_qty": 35,
            "is_featured": False,
            "images": [
                "https://images.unsplash.com/photo-1522337360788-8b13edd793be?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": makeup,
            "name": "Ultimate 9-Color Eyeshadow Palette",
            "description": "Create endless looks with our curated palette of 9 highly-pigmented matte and shimmer shades. Features warm neutrals, copper glitters, and deep brown accents.",
            "ingredients": "Talc, Mica, Magnesium Stearate, Dimethicone, Ethylhexyl Palmitate, Polybutene, Synthetic Fluorphlogopite.",
            "how_to_use": "Apply lighter shades as a base, define the crease with medium shades, and pat shimmers onto the center of the eyelid.",
            "mrp": Decimal("1499.00"),
            "offer_price": Decimal("1099.00"),
            "stock_qty": 20,
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80"
            ]
        },

        # --- SKINCARE ---
        {
            "category": skincare,
            "name": "Vitamin C Radiance Serum",
            "description": "Brighten dark spots and even out skin tone with our 15% Vitamin C serum. Enhanced with Ferulic Acid and Hyaluronic Acid for maximum antioxidant protection and deep hydration.",
            "ingredients": "Water, L-Ascorbic Acid (Vitamin C), Propanediol, Glycerin, Ferulic Acid, Sodium Hyaluronate, Phenoxyethanol.",
            "how_to_use": "Apply 3-4 drops to a clean, dry face in the morning. Follow with moisturizer and sunscreen.",
            "mrp": Decimal("899.00"),
            "offer_price": Decimal("699.00"),
            "stock_qty": 8, # Low stock to test alerts
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": skincare,
            "name": "Hyaluronic Acid Hydrating Gel Cream",
            "description": "A oil-free, lightweight gel moisturizer that instantly floods the skin with moisture. Plumps up fine lines and keeps skin hydrated for 72 hours.",
            "ingredients": "Water, Dimethicone, Glycerin, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice, Ceramide NP.",
            "how_to_use": "Smooth evenly over face and neck after cleansing and serum application, both morning and night.",
            "mrp": Decimal("699.00"),
            "offer_price": Decimal("549.00"),
            "stock_qty": 50,
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": skincare,
            "name": "Matte Ultra-Light Sunscreen SPF 50",
            "description": "An broad-spectrum SPF 50 sunscreen with a non-greasy, matte finish. Leaves zero white cast and is sweat and water-resistant.",
            "ingredients": "Water, Ethylhexyl Methoxycinnamate, Zinc Oxide, Cyclopentasiloxane, Silica, Butylene Glycol.",
            "how_to_use": "Apply generously on face, neck, and exposed skin 15 minutes before sun exposure. Reapply every 2 hours.",
            "mrp": Decimal("599.00"),
            "offer_price": Decimal("479.00"),
            "stock_qty": 70,
            "is_featured": False,
            "images": [
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": skincare,
            "name": "Gentle Foaming Face Wash",
            "description": "Cleanse away dirt, oil, and impurities without stripping your skin. Infused with green tea extract and chamomile to soothe sensitive skin.",
            "ingredients": "Water, Cocamidopropyl Betaine, Sodium Lauroyl Methyl Isethionate, Glycerin, Green Tea Extract, Chamomile Extract.",
            "how_to_use": "Pump foam onto wet palms, gently massage onto face in circular motions, and rinse thoroughly with lukewarm water.",
            "mrp": Decimal("399.00"),
            "offer_price": Decimal("299.00"),
            "stock_qty": 40,
            "is_featured": False,
            "images": [
                "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop&q=80"
            ]
        },

        # --- HAIRCARE ---
        {
            "category": haircare,
            "name": "Onion & Black Seed Hair Oil",
            "description": "Nourish your scalp and promote healthy hair growth with our cold-pressed Onion and Black Seed Hair Oil. Red onions help reduce hair fall and strengthen roots.",
            "ingredients": "Onion Seed Oil, Black Seed Oil, Sweet Almond Oil, Coconut Oil, Olive Oil, Castor Oil, Vitamin E.",
            "how_to_use": "Massage gently onto hair and scalp. Leave on for at least 1 hour or overnight, then wash with a mild shampoo.",
            "mrp": Decimal("499.00"),
            "offer_price": Decimal("399.00"),
            "stock_qty": 30,
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": haircare,
            "name": "Anti-Dandruff Tea Tree Shampoo",
            "description": "Say goodbye to flakes and itchy scalp. Our Tea Tree shampoo gently cleanses, balances scalp oils, and prevents dandruff recurrence.",
            "ingredients": "Water, Sodium Lauroyl Sarcosinate, Tea Tree Essential Oil, Salicylic Acid, Aloe Vera Extract.",
            "how_to_use": "Apply to wet hair, lather from scalp to ends, leave on for 2 minutes, and rinse thoroughly.",
            "mrp": Decimal("549.00"),
            "offer_price": Decimal("429.00"),
            "stock_qty": 40,
            "is_featured": False,
            "images": [
                "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80"
            ]
        },
        {
            "category": haircare,
            "name": "Argan Oil Hair Repair Mask",
            "description": "Deeply condition and repair damaged, dry hair with Moroccan Argan oil. Restores shine, elasticity, and softness in just one use.",
            "ingredients": "Water, Cetearyl Alcohol, Moroccan Argan Oil, Shea Butter, Behentrimonium Chloride, Panthenol.",
            "how_to_use": "After shampooing, apply a generous amount from mid-lengths to ends. Leave on for 5-10 minutes, then rinse.",
            "mrp": Decimal("799.00"),
            "offer_price": Decimal("599.00"),
            "stock_qty": 18,
            "is_featured": True,
            "images": [
                "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop&q=80"
            ]
        }
    ]

    print("Creating products and images...")
    for p_data in products_data:
        images_urls = p_data.pop("images")
        cat = p_data.pop("category")
        prod = Product.objects.create(category=cat, **p_data)
        
        for i, url in enumerate(images_urls):
            ProductImage.objects.create(
                product=prod,
                image_url=url,
                is_primary=(i == 0),
                sort_order=i
            )
        print(f"Created product: {prod.name}")

    print("Creating discount coupons...")
    Coupon.objects.create(
        code="WELCOME10",
        description="10% Off on your first order!",
        discount_type="percentage",
        discount_value=Decimal("10.00"),
        min_order_value=Decimal("499.00"),
        max_discount_amount=Decimal("150.00"),
        max_uses=1000,
        is_active=True,
        valid_from=timezone.now(),
        valid_until=timezone.now() + timezone.timedelta(days=365)
    )

    Coupon.objects.create(
        code="FLAT100",
        description="Flat ₹100 Off on orders above ₹999",
        discount_type="fixed",
        discount_value=Decimal("100.00"),
        min_order_value=Decimal("999.00"),
        max_uses=500,
        is_active=True,
        valid_from=timezone.now(),
        valid_until=timezone.now() + timezone.timedelta(days=180)
    )

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
