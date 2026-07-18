from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


# Lightweight health-check endpoint for cron job / uptime monitoring.
# Returns 200 OK so external services (e.g. cron-job.org) can verify
# the backend is alive without triggering expensive database queries.
def health_check(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/shipments/', include('shipments.urls')),
    path('api/discounts/', include('discounts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
