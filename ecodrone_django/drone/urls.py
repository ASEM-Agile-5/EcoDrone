from django.urls import path
from .views import DroneListView, RegisterDroneView, SetDroneStatusView, DroneByStatusView, DroneDetailsView, DroneUpdateView  

urlpatterns = [
    path('register', RegisterDroneView.as_view(), name='register-drone'),
    path('list', DroneListView.as_view(), name='drone-list'),
    path('set-status', SetDroneStatusView.as_view(), name='set-status'),
    path('update/<int:drone_id>', DroneUpdateView.as_view(), name='update-drone'),
    path('status', DroneByStatusView.as_view(), name='drone-status'),
    path('details/<int:drone_id>', DroneDetailsView.as_view(), name='drone-status'),
    path('deactivate/<int:drone_id>', DroneUpdateView.as_view(), name='drone-deactivate')


]
