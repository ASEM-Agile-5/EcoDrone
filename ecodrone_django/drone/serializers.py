from rest_framework import serializers
from .models import Drone

class DroneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drone
        fields = ['id', 'name', 'model', 'max_payload', 'registered_by', 'status', 'battery_level', 'current_location', 'last_flight']
        read_only_fields = ['id', 'registered_by']

class DroneStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drone
        fields = ['status']

    def validate_status(self, value):
        if value not in ['Active', 'Inactive']:
            raise serializers.ValidationError("Status must be 'Active' or 'Inactive'")
        return value

class DroneUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drone
        fields = ['name', 'battery_level', 'current_location', 'last_flight']
        
class DroneDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drone
        fields = ['status']
