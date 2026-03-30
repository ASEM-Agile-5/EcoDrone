from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from users.models import User
from .models import Drone
from .serializers import DroneSerializer, DroneUpdateSerializer,DroneDeleteSerializer,DroneStatusSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model



class RegisterDroneView(APIView):
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
                return Response({"error": "Only superusers can register drones"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = DroneSerializer(data=request.data)
            if serializer.is_valid():
                drone = serializer.save(registered_by=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class DroneListView(APIView):
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
                drones = Drone.objects.filter(status='Active')
                serializer =DroneSerializer (drones, many=True)
                return Response({
                    "drones": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                drones = Drone.objects.all()
                serializer = DroneSerializer(drones, many=True)
                return Response({
                    "drones": serializer.data
                }, status=status.HTTP_200_OK)
            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)



class DroneDetailsView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            if not user_id:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            drone_id = request.query_params.get('drone_id')
            if not drone_id:
                return Response({"error": "drone_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            drone = Drone.objects.get(id=drone_id)
            serializer = DroneSerializer(drone)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Drone.DoesNotExist:
            return Response({"error": "Drone not found"}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class DroneUpdateView(APIView):
    def put(self, request, drone_id):
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

            drone = Drone.objects.get(id=drone_id)
            if not drone:
                return Response({"error": "Drone not found"}, status=status.HTTP_404_NOT_FOUND)
             
            serializer = DroneUpdateSerializer(drone, data=request.data, partial=True)
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


    def delete(self, request, drone_id):
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

            drone = Drone.objects.get(id=drone_id)
            if not drone:
                return Response({"error": "Drone not found"}, status=status.HTTP_404_NOT_FOUND)
             
            serializer = DroneDeleteSerializer(drone, data={"status": "Inactive"}, partial=True)
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

class SetDroneStatusView(APIView):
    def get(self, request):
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
                drone = Drone.objects.get(id=request.data.get('drone_id'))
                serializer = DroneStatusSerializer(drone, data={"status": "Inactive"}, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"message": "Drone status updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Drone.DoesNotExist:
                return Response({"error": "Drone not found"}, status=status.HTTP_404_NOT_FOUND)

            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DroneByStatusView(APIView):
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

            drone = Drone.objects.filter(status=order_status)
            serializer = DroneSerializer(drone, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Drone.DoesNotExist:
            return Response({"error": "Drone not found"}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)