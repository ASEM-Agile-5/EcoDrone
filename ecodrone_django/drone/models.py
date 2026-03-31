from django.db import models
from django.utils import timezone

class Drone(models.Model):
    name = models.CharField(max_length=255)
    model = models.CharField(max_length=100, default="ED-X1")
    max_payload = models.CharField(max_length=50, default="0kg")
    registered_by = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=100, default="Idle")
    battery_level = models.CharField(max_length=50, default="100%")
    current_location = models.CharField(max_length=255, default="Base")
    last_flight = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name
