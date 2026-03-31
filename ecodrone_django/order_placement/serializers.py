from rest_framework import serializers
from .models import Order, Location



class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_id', 'user', 'timestamp', 'vendor', 'location', 'total_amount', 'status', 'assigned_drone', 'image_url']
        read_only_fields = ['order_id', 'status']
        
class UserOrderSerializer(serializers.ModelSerializer):
    past_orders = serializers.SerializerMethodField()
    current_orders = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['past_orders', 'current_orders']
    
    def get_past_orders(self, obj):
        orders = Order.objects.filter(status='Completed')
        serializer = OrderSerializer(orders, many=True)
        return serializer.data

    def get_current_orders(self, obj):
        orders = Order.objects.filter(status='In Progress')
        serializer = OrderSerializer(orders, many=True)
        return serializer.data
class OrderRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['vendor', 'location', 'total_amount', 'timestamp', 'user']
        # read_only_fields = ['user']

class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_id', 'status']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'latitude', 'longitude', 'name', 'description']
        read_only_fields = ['id']