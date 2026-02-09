from django.shortcuts import render

# Create your views here.
from django.urls import path
from .views import RegisterView, LoginView, UserView, LogoutView, UserViewToo


urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('get-user', UserView.as_view(), name='user'),
    # path('get-user-too', UserViewToo.as_view(), name='user-too'),
    path('logout', LogoutView.as_view(), name='logout'),
]