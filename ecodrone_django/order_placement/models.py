from django.db import models
from django.conf import settings
from vendors.models import Vendor


class Order(models.Model):
    order_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order_time = models.DateTimeField()
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    location = models.CharField(max_length=255)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default="in Progress")
    assigned_drone = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.status}"
