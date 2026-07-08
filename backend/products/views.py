from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, BrandBanner
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer, BrandBannerSerializer


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
            qs = qs.filter(is_active=True)

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
            .filter(is_featured=True, is_active=True)
            .prefetch_related('images')[:8]
        )


class NewArrivalsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
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
