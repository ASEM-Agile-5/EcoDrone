from django.db import models
from django.utils import timezone

class Drone(models.Model):
    name = models.CharField(max_length=255)
    registered_by = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=100)
    battery_level = models.CharField(max_length=50)  # Using CharField to accommodate "85%" format
    current_location = models.CharField(max_length=255)
    last_flight = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name
