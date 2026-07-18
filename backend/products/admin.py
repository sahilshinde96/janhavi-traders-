from django.contrib import admin
from .models import Category, Product, ProductImage, BrandBanner, HeroBanner, Wishlist


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image_url', 'is_primary', 'sort_order']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'sort_order', 'created_at']
    list_editable = ['is_active', 'sort_order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'mrp', 'offer_price', 'stock_qty', 'is_active', 'is_featured']
    list_editable = ['is_active', 'is_featured', 'stock_qty']
    list_filter = ['category', 'is_active', 'is_featured']
    search_fields = ['name', 'sku']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    readonly_fields = ['sku', 'created_at', 'updated_at']


@admin.register(BrandBanner)
class BrandBannerAdmin(admin.ModelAdmin):
    list_display = ['name', 'sort_order', 'created_at']
    list_editable = ['sort_order']
    search_fields = ['name']


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'sort_order', 'created_at']
    list_editable = ['sort_order']
    search_fields = ['title', 'subtitle']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'product__name']
    raw_id_fields = ['user', 'product']
