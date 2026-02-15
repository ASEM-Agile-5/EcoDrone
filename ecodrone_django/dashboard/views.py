from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from order_placement.models import Order
from drone.models import Drone
from .serializers import DashboardStatsSerializer

class DashboardStatsView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # Assuming payload contains 'is_superuser' or we fetch user to check
            # For this example, let's assume we decode and check a flag or fetch user if needed.
            # Mirroring the user's requested pattern:
            # user = jwt.decode(...) -> this returns a dict, so we likely need to check the claim directly or fetch user.
            
            # If the token payload has 'is_superuser' directly:
            # if not payload.get('is_superuser'):
            #    return ...
            
            # OR typically we fetch the user from DB as seen in previous views:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(id=payload.get('user_id'))
                if not user.is_superuser:
                    return Response({"error": "Only superusers can access dashboard stats"}, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


            # 1. Total Active Orders (assuming 'In Progress' or similar means active?)
            # The prompt asks for "Total Active Orders" and "All in progrss order".
            # Let's interpret "Total Active Orders" as a count of orders that are not completed/failed.
            # And "All in progress order" might mean the list of them or just the count of 'In Progress'.
            # Let's fetch counts for now based on common status.
            
            total_active_orders_count = Order.objects.filter(status__iexact='In Progress').count() 
            # Note: adjust 'In Progress' to match your exact status string in DB
            
            # 2. Active Drones
            active_drones_count = Drone.objects.filter(status__iexact='Active').count()
            # Note: adjust 'Active' to match your exact status string in DB

            data = {
                "total_active_orders": total_active_orders_count,
                "active_drones": active_drones_count
            }
            
            serializer = DashboardStatsSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
