from rest_framework import serializers

class DashboardStatsSerializer(serializers.Serializer):
    total_active_orders = serializers.IntegerField()
    active_drones = serializers.IntegerField()
