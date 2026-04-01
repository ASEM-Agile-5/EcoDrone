from django.urls import path
from .views import MenuByVendorView, PlaceOrderView, OrderDetailsView, OrderView, OrderByStatusView, SetOrderStatusView, OrderByUserView, LocationListView, RegisterLocationView, AssignDroneView

urlpatterns = [
    path('menus', MenuByVendorView.as_view(), name='menu-list'),
    path('place-order', PlaceOrderView.as_view(), name='place-order'),
    path('details', OrderDetailsView.as_view(), name='order-details'),
    path('all', OrderView.as_view(), name='all-orders'),
    path('status', OrderByStatusView.as_view(), name='order-status'),
    path('set-status', SetOrderStatusView.as_view(), name='set-order-status'),
    path('dispatch-order', AssignDroneView.as_view(), name='dispatch-order'),
    path('location-list', LocationListView.as_view(), name='location-list'),
    path('register-location', RegisterLocationView.as_view(), name='register-location'),
    path('user-orders', OrderByUserView.as_view(), name='user-orders')
]
