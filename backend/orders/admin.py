from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'quantity', 'unit_price', 'subtotal', 'product_sku']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_amount', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['user__email', 'user__phone']
    list_editable = ['status']
    readonly_fields = ['subtotal', 'total_amount', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
