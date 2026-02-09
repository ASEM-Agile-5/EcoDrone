# views.py
from rest_framework import status, views
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer
import jwt, datetime
from django.conf import settings
from .models import User


class RegisterView(views.APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # .save() calls the UserManager.create_user method
            user = serializer.save()
            
            # Convention: Do not log the user in immediately if 
            # you require email verification first.
            return Response({
                "message": "User created successfully",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class LoginView(views.APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']

            # 1. Use timezone-aware datetimes (utcnow is deprecated)
            now = datetime.datetime.now(datetime.timezone.utc)
            payload = {
                'user_id': str(user.id), # Ensure UUID is a string
                'exp': now + datetime.timedelta(minutes=60),
                'iat': now
            }
            
            # 2. Modern PyJWT returns a string, no need to .decode('utf-8')
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm =   settings.JWT_ALGORITHM)
              # Debugging line
            # 3. Create the response object first
            response = Response({
                "message": "Login successful",
                "user_id": user.id,
                "token": token,
            }, status=status.HTTP_200_OK)

            # 4. Set the cookie on the response object
            response.set_cookie(
                key='access_token',
                value=token,
                httponly=True,   # Security: Prevents JS access
                secure = settings.DEBUG,     # Security: Only over HTTPS
                samesite='None',  # Security: CSRF protection
                max_age=60  * settings.JWT_EXPIRY_MINUTES,   # 1 hour
                path='/'        # Cookie is valid for the entire domain
            )

            return response
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserViewToo(views.APIView):  
    
    def get(self, request):
        print("Generated JWT:", settings.DEBUG)
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')
        print("ALL COOKIES:", request.COOKIES)
        print("Token from cookie:", token)  # Debugging line

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            "userId": user.id,
            "email": user.email,
            "firstName": user.accounts.first_name,
            "lastName": user.accounts.last_name,
        }, status=status.HTTP_200_OK)


class UserView(views.APIView):  
    
    def get(self, request):
        print("Generated JWT:", settings.DEBUG)
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')
        # print("ALL COOKIES:", request.COOKIES)
        # print("Token from cookie:", token)  # Debugging line

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            "user_id": user.id,
            "email": user.email,
            "first_name": user.accounts.first_name,
            "last_name": user.accounts.last_name,
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    def post(self, request):
        response = Response({
            "message": "Logout successful"
        }, status=status.HTTP_200_OK)
        response.delete_cookie('token')
        return response