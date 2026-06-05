from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image',
                  'is_active', 'sort_order', 'product_count', 'created_at']
        read_only_fields = ['created_at']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'is_primary', 'sort_order']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    discount_percent = serializers.ReadOnlyField()
    primary_image = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'mrp', 'offer_price', 'discount_percent', 'primary_image',
            'stock_qty', 'is_active', 'is_featured', 'created_at',
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    discount_percent = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)
    image_urls = serializers.ListField(
        child=serializers.URLField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'description', 'ingredients', 'how_to_use',
            'mrp', 'offer_price', 'discount_percent',
            'stock_qty', 'sku', 'is_active', 'is_featured',
            'images', 'image_urls', 'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'sku', 'created_at', 'updated_at']

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        product = Product.objects.create(**validated_data)
        for i, url in enumerate(image_urls):
            ProductImage.objects.create(
                product=product, image_url=url, is_primary=(i == 0), sort_order=i
            )
        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if image_urls is not None:
            instance.images.all().delete()
            for i, url in enumerate(image_urls):
                ProductImage.objects.create(
                    product=instance, image_url=url, is_primary=(i == 0), sort_order=i
                )
        return instance
