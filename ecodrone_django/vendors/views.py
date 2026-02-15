from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Vendor, Category, Menu
from .serializers import CategorySerializer, MenuSerializer, VendorSerializer, VendorStatusSerializer, MenuUpdateSerializer, MenuDeleteSerializer
from order_placement.models import Order
from order_placement.serializers import OrderSerializer



class RegisterVendorView(APIView):
    def post(self, request):
        User = get_user_model() 
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = VendorSerializer(data=request.data)
            if serializer.is_valid():
                vendor = serializer.save(registered_by=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)




class VendorListView(APIView):
    def get(self, request):
        User = get_user_model() 
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            if not user.is_superuser:
                vendors = Vendor.objects.filter(status='Active')
                serializer = VendorSerializer(vendors, many=True)
                return Response({
                    "vendors": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                vendors = Vendor.objects.all()
                serializer = VendorSerializer(vendors, many=True)
                return Response({
                    "vendors": serializer.data
                }, status=status.HTTP_200_OK)
            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)


class MenuCreateView(APIView):
    def post(self, request):
        User = get_user_model() 
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')
        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)

            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = MenuSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 
 
class MenuDetailView(APIView):

    def get(self, request, vendor_id):
        User = get_user_model() 
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token: 
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)

            menus = Menu.objects.filter(vendor_id=vendor_id)
            serializer = MenuSerializer(menus, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MenuUpdateView(APIView):
    def put(self, request, vendor_id):
        User = get_user_model() 
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token: 
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)

            menus = Menu.objects.get(id=vendor_id)
            if not menus:
                return Response({"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)
             
            serializer = MenuUpdateSerializer(menus, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        # Delete logic with auth check
        User = get_user_model() 
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token: 
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)

            menus = Menu.objects.get(id=pk)
            if not menus:
                return Response({"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)
             
            serializer = MenuDeleteSerializer(menus, data={"status": "Inactive"}, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

           
class CategoryListView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            user = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            if not user.is_superuser:
                return Response({"error": "Only superusers can register vendors"}, status=status.HTTP_403_FORBIDDEN)
            
            categories = Category.objects.all()
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderByVendorView(APIView):
    def post(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # We need to verify the token and check if the user is a superuser
            # Note: jwt.decode returns a dict, not a user object. 
            # We need to fetch the User object to check is_superuser.
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get('user_id')
            
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            if not user.is_superuser:
                return Response({"error": "Only superusers can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)
            
            vendor_id = request.data.get('vendor_id') or request.query_params.get('vendor_id')
            if not vendor_id:
                return Response({"error": "vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            orders = Order.objects.filter(vendor__id=vendor_id)

            serializer = OrderSerializer(orders, many=True)
            if not serializer.data:
                return Response({"message": "No orders found for this vendor"}, status=status.HTTP_200_OK)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)

        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)


class SetVendorStatusView(APIView):
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
                return Response({"error": "Only superusers can view/update vendor status"}, status=status.HTTP_403_FORBIDDEN)
            
            try:
                vendor = Vendor.objects.get(id=request.data.get('vendor_id'))
                serializer = VendorStatusSerializer(vendor, data={"status": "Inactive"}, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"message": "Vendor status updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Vendor.DoesNotExist:
                return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)