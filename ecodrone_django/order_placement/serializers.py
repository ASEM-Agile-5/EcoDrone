from rest_framework import serializers
from .models import Order, Location


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, required=False)

    def get_customer_name(self, obj):
        accounts = getattr(obj.user, 'accounts', None)
        if not accounts:
            return obj.user.email

        first_name = accounts.first_name or ""
        last_name = accounts.last_name or ""
        full_name = f"{first_name} {last_name}".strip()
        return full_name or obj.user.email

    def get_customer_email(self, obj):
        return obj.user.email

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order

    class Meta:
        model = Order
        fields = ['order_id', 'user', 'timestamp', 'vendor', 'vendor_name', 'customer_name', 'customer_email', 'location', 'total_amount', 'status', 'assigned_drone', 'image_url', 'items']
        read_only_fields = ['order_id', 'vendor_name', 'customer_name', 'customer_email', 'status']
        
class UserOrderSerializer(serializers.ModelSerializer):
    past_orders = serializers.SerializerMethodField()
    current_orders = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['past_orders', 'current_orders']
    
    def get_past_orders(self, obj):
        user_id = self.context.get('user_id')
        orders = Order.objects.filter(user_id=user_id, status='Completed')
        serializer = OrderSerializer(orders, many=True)
        return serializer.data

    def get_current_orders(self, obj):
        user_id = self.context.get('user_id')
        orders = Order.objects.filter(user_id=user_id, status='In Progress')
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
class AssignDroneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['assigned_drone']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'latitude', 'longitude', 'name', 'description']
        read_only_fields = ['id']

class OrderDeliveryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_id', 'status', 'assigned_drone']
        read_only_fields = ['order_id']