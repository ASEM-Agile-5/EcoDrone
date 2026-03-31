from rest_framework import serializers
from .models import Vendor, Category, Menu

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'vendor_id', 'name', 'registered_by', 'registration_time', 'menu_count', 'terms_agreed_at','owned_by', 'vendor_contact', 'owner_contact', 'volume_processed', 'value_processed', 'status', 'image_url', 'eta', 'rating']
        read_only_fields = ['id', 'vendor_id', 'registration_time', 'registered_by', 'menu_count', 'volume_processed', 'value_processed']

class RegisterVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['name', 'owned_by', 'vendor_contact', 'owner_contact', "terms_agreed_at", "status", "image_url"]
        
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
        read_only_fields = ['id']


class MenuSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), source='vendor', write_only=True, required=False, allow_null=True
    )
    class Meta:
        model = Menu
        fields = ['id', 'name', 'price', 'description', 'image_url', 'category_id', 'vendor_id', 'status', 'date_added']
        read_only_fields = ['id', 'status', 'date_added']
        
class MenuUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ['name', 'price', 'description', 'image_url']


class MenuDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ['id', 'status']
        read_only_fields = ['id']

class VendorStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['vendor_id', 'status']
        read_only_fields = ['vendor_id']

