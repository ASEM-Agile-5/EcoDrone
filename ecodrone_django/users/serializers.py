from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User , Accounts  # This is the custom model we created earlier
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):
    # We add a write_only field for confirmation so it's not saved to the DB
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(write_only=True, required=True)
    # BooleanField that must be True
    terms_accepted = serializers.BooleanField(write_only=True, required=True)


    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms.")
        return value
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'username', 'terms_accepted')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        """
        Uses Django's built-in password validators (defined in settings.py)
        to check for length, complexity, and common passwords.
        """
        validate_password(value)
        return value

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms.")
        jls_extract_var = value
        return jls_extract_var

    def validate(self, data):
        """
        Object-level validation to ensure passwords match.
        """
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """
        This method is called when you run serializer.save() in the view.
        It removes the confirmation field and uses the UserManager to hash the password.
        """
     # 1. Pop out profile data so it doesn't break User creation
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        username = validated_data.pop('username')
        validated_data.pop('password_confirm')
        validated_data.pop('terms_accepted')
    # Start the atomic block
        with transaction.atomic():
        # 2. Create the User (the 'Account Holder')
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
            )

            # 3. Create the Profile (the 'Account Details') linked to that user
            Accounts.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                username= username,
                terms_agreed_at=timezone.now()
            )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Best practice: use Django's authenticate() which handles the hash check
            user = authenticate(email=email, password=password)
            
            if not user:
                raise serializers.ValidationError("Incorrect credentials")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
        else:
            raise serializers.ValidationError("Both email and password are required.")

        # Key fix: return a dictionary containing the user
        data['user'] = user
        return data
