from django.db import models
from django.conf import settings
import random
import string
import uuid




class Vendor(models.Model):
    id = models.BigAutoField(primary_key=True)
    vendor_id = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=255)
    registered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='registered_vendors')
    registration_time = models.DateTimeField(auto_now_add=True)
    rating = models.FloatField(default=5)
    eta = models.IntegerField(help_text="Estimated time of arrival in minutes", default=5)
    owned_by = models.CharField(max_length=100)
    vendor_contact = models.CharField(max_length=15)
    owner_contact = models.CharField(max_length=15)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    menu_count = models.IntegerField(default=0)
    terms_agreed_at = models.DateTimeField(null=True, blank=True)
    volume_processed = models.IntegerField(default=0)
    value_processed = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='Active')

    def save(self, *args, **kwargs):
        if not self.vendor_id:
             self.vendor_id = self.generate_vendor_id()
        super().save(*args, **kwargs)

    def generate_vendor_id(self):
        # Generate VND- + 6 random digits? Or check uniqueness
        while True:
            code = 'VND-' + ''.join(random.choices(string.digits, k=6))
            if not Vendor.objects.filter(vendor_id=code).exists():
                return code

    def __str__(self):
        return f"{self.name} ({self.vendor_id})"


class Category(models.Model):
    name = models.CharField(max_length=100)
    id = models.BigAutoField(primary_key=True)

     
    def __str__(self):
        return self.name


class Menu(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    status = models.CharField(max_length=20, default='Active')
    date_added = models.DateTimeField(auto_now_add=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.vendor.name}"

