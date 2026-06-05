from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='products'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured'),
    path('new-arrivals/', views.NewArrivalsView.as_view(), name='new-arrivals'),
    path('low-stock/', views.LowStockView.as_view(), name='low-stock'),
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
]
