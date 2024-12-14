from typing import List
from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.files.models import File

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_active', 'role', 'date_joined', 'last_login')
        read_only_fields = ('date_joined', 'last_login')

class AdminFileSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    
    class Meta:
        model = File
        fields = (
            'id', 'original_name', 'file_type', 'size', 
            'created_at', 'is_shared', 'owner_email'
        )

class AdminService:
    @staticmethod
    def get_all_users() -> List[User]:
        """Get all users in the system"""
        return User.objects.all()

    @staticmethod
    def update_user(user_id: str, data: dict) -> User:
        """Update user details"""
        user = User.objects.get(id=user_id)
        for key, value in data.items():
            setattr(user, key, value)
        user.save()
        return user

    @staticmethod
    def delete_user(user_id: str) -> None:
        """Delete a user"""
        user = User.objects.get(id=user_id)
        user.delete()

    @staticmethod
    def get_user_files(user_id: str) -> List[File]:
        """Get all files for a specific user"""
        user = User.objects.get(id=user_id)
        files = user.files.all()
        return AdminFileSerializer(files, many=True).data

    @staticmethod
    def delete_file(file_id: str) -> None:
        """Delete a file"""
        file = File.objects.get(id=file_id)
        file.delete()