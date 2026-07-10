from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, BrandBanner, HeroBanner
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer, BrandBannerSerializer, HeroBannerSerializer


class CategoryListView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        from django.db.models import Count, Q
        queryset = Category.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            queryset = queryset.filter(is_active=True)
        return queryset.annotate(
            product_count=Count('products', filter=Q(products__is_active=True))
        )

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class ProductListView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'is_active']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['offer_price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('images')
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_active=True, stock_qty__gt=0)

        cat_slug = self.request.query_params.get('category_slug')
        if cat_slug:
            qs = qs.filter(category__slug=cat_slug)

        min_p = self.request.query_params.get('min_price')
        max_p = self.request.query_params.get('max_price')
        if min_p:
            qs = qs.filter(offer_price__gte=min_p)
        if max_p:
            qs = qs.filter(offer_price__lte=max_p)

        return qs

    def get_serializer_class(self):
        return ProductDetailSerializer if self.request.method == 'POST' else ProductListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.prefetch_related('images').select_related('category')
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class FeaturedProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_featured=True, is_active=True, stock_qty__gt=0)
            .prefetch_related('images')[:8]
        )


class NewArrivalsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True, stock_qty__gt=0)
            .prefetch_related('images')
            .order_by('-created_at')[:8]
        )


class LowStockView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Product.objects.filter(stock_qty__lte=10).prefetch_related('images')


class BrandBannerListView(generics.ListCreateAPIView):
    queryset = BrandBanner.objects.all()
    serializer_class = BrandBannerSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class BrandBannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BrandBanner.objects.all()
    serializer_class = BrandBannerSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class HeroBannerListView(generics.ListCreateAPIView):
    serializer_class = HeroBannerSerializer

    def get_queryset(self):
        if not HeroBanner.objects.exists():
            HeroBanner.objects.create(
                title="Your Glow Journey Begins Here",
                subtitle="Explore dermatologist-tested cosmetics and skincare products curated to match your skin's unique needs.",
                image_url="https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600",
                link_url="/products?category=skincare",
                button_text="Explore Skincare",
                sort_order=1
            )
            HeroBanner.objects.create(
                title="Beauty That Defines You",
                subtitle="Discover authentic cosmetics from top brands. Makeup, Skincare & Haircare — all in one place.",
                image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600",
                link_url="/products",
                button_text="Shop Now",
                sort_order=2
            )
            HeroBanner.objects.create(
                title="Mega Beauty Discounts",
                subtitle="Get this bestseller now at an unbeatable price! Only COD and free shipping above ₹299.",
                image_url="https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1600",
                link_url="/products?is_featured=true",
                button_text="Grab this Offer",
                sort_order=3,
                is_deal_of_the_day=True
            )
        return HeroBanner.objects.all()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class HeroBannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HeroBanner.objects.all()
    serializer_class = HeroBannerSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
