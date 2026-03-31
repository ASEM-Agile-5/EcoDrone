from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from .models import Vendor, Order
from .serializers import OrderSerializer, OrderStatusSerializer, OrderRequestSerializer, UserOrderSerializer, OrderDeliveryUpdateSerializer
from django.contrib.auth import get_user_model
from . import order_status
# import requests
import uuid


class OrderView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # We need to verify the token and check if the user is a superuser
            # Note: jwt.decode returns a dict, not a user object. 
            # We need to fetch the User object to check is_superuser.
            
            
            User = get_user_model()
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get('user_id')
                user = User.objects.get(id=user_id)
                if not user.is_superuser:
                    return Response({"error": "Only superusers can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)
                
                orders = Order.objects.all()
                serializer = OrderSerializer(orders, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            if not user.is_superuser:
                return Response({"error": "Only superusers can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)
            
            vendor_id = request.data.get('vendor_id') or request.query_params.get('vendor_id')
            if not vendor_id:
                return Response({"error": "vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Assuming the request passes the database ID (pk) or the string vendor_id
            # The prompt says "vendorId", which could be the string 'VND-XXXX' or the PK.
            # Let's try to filter by the vendor ForeignKey.
            # If vendor_id is the string 'VND-XXXX', we first need to find the vendor pk.          
    
                try:
                    orders = Order.objects.all()
                except Order.DoesNotExist:
                    return Response({"error": "Orders not found"}, status=status.HTTP_404_NOT_FOUND)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
     
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class OrderByUserView(APIView):

    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            if not user_id:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            orders = Order.objects.filter(user_id=user_id)
            serializer = UserOrderSerializer(orders, many=False)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
class MenuByVendorView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            if not user_id:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            vendor_id = request.query_params.get('vendor_id')
            if not vendor_id:
                # If no vendor_id is passed, return error or all menus? 
                # Prompts says "belong to a vendor using the vendor Ids". Implies filtering.
                return Response({"error": "vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            menus = Menu.objects.filter(vendor_id=vendor_id)
            serializer = MenuSerializer(menus, many=True)
            return Response({
                "menus": serializer.data
            }, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
            

class PlaceOrderView(APIView):

    def get_assigned_drone(self):
        return "DRONE-001"
    #     # In a real scenario, this URL would be in settings
    #     drone_service_url = "http://localhost:8001/api/drones/available/" 
        
    #     try:
    #         # Make the GET request to the external service
    #         response = requests.get(drone_service_url, timeout=5)
            
    #         if response.status_code == 200:
    #             data = response.json()
    #             # Assuming the API returns a list and we pick the first one, 
    #             # or calls /assign endpoint which returns a single drone
    #             # Adjust key access based on actual response structure
    #             return data.get('drone_id') 
    #         else:
    #             print(f"Error fetching drone: {response.status_code}")
    #             return None
    #     except requests.exceptions.RequestException as e:
    #         print(f"Request failed: {e}")
    #         return None

    def post(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            if not user_id:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Generate Order ID
            order_id = str(uuid.uuid4())
            
            # Get assigned drone
            assigned_drone = self.get_assigned_drone()

            # Prepare data
            data = request.data.copy()
            data['assigned_drone'] = assigned_drone

            serializer = OrderSerializer(data=data)
            if serializer.is_valid():
                serializer.save(order_id=order_id)
                # You might want to return the drone info specifically or just the full order
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)


class OrderDetailsView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            if not user_id:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            order_id = request.query_params.get('order_id')
            if not order_id:
                return Response({"error": "order_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.get(order_id=order_id)
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class OrderByStatusView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            if not user_id:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            order_status = request.query_params.get('status')
            if not order_status:
                return Response({"error": "status is required"}, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.filter(status=order_status)
            serializer = OrderSerializer(order, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class SetOrderStatusView(APIView):
    def post(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            User = get_user_model()
            user = User.objects.get(id=user_id)

            if not user.is_superuser:
                return Response({"error": "Only superusers can view/update drone status"}, status=status.HTTP_403_FORBIDDEN)
            
            try:
                order = Order.objects.get(order_id=request.data.get('order_id'))
                update_data = {}
                requested_status = request.data.get('status')
                if requested_status is not None:
                    if requested_status == "Completed":
                        update_data["status"] = order_status.COMPLETED
                    elif requested_status == "Failed":
                        update_data["status"] = order_status.FAILED
                    elif requested_status == "In Progress":
                        update_data["status"] = order_status.IN_PROGRESS
                    elif requested_status == "Pending":
                        update_data["status"] = order_status.PENDING
                    else:
                        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

                if 'assigned_drone' in request.data:
                    update_data["assigned_drone"] = request.data.get('assigned_drone') or None

                if not update_data:
                    return Response({"error": "No updates provided"}, status=status.HTTP_400_BAD_REQUEST)

                serializer = OrderDeliveryUpdateSerializer(order, data=update_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"message": "Order updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Order.DoesNotExist:
                return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)           
  
