from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'used_count', 'is_active', 'valid_until']
    list_editable = ['is_active']
    search_fields = ['code']
    readonly_fields = ['used_count', 'created_at']


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'order', 'created_at']
    readonly_fields = ['coupon', 'user', 'order', 'created_at']
