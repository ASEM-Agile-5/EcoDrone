from rest_framework import serializers
from .models import Order



class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_id', 'user', 'order_time', 'vendor', 'location', 'amount_paid', 'status', 'assigned_drone']
        read_only_fields = ['order_id', 'status']


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_id', 'status']