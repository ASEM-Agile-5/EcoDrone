from django.urls import path
from .views import RegisterVendorView, MenuCreateView, MenuDetailView, OrderByVendorView, CategoryListView, VendorListView, MenuUpdateView, SetVendorStatusView

urlpatterns = [
    path('vendors', VendorListView.as_view(), name='vendor-list'),
    path('register', RegisterVendorView.as_view(), name='register-vendor'),
    path('categories', CategoryListView.as_view(), name='category-list'),
    path('menu/create/', MenuCreateView.as_view(), name='menu-create'),
    path('menu/update/<int:vendor_id>', MenuUpdateView.as_view(), name='menu-update'),
    path('menu/<int:vendor_id>', MenuDetailView.as_view(), name='menu-detail'),
    path('menu/delete/<int:pk>', MenuUpdateView.as_view(), name='menu-delete'),
    path('orders', OrderByVendorView.as_view(), name='vendor-orders'),
    path('deactivate', SetVendorStatusView.as_view(), name='vendor-deactivate'),
]
