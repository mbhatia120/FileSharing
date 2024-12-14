from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin
from .services import AdminService, AdminUserSerializer, AdminFileSerializer
from django.contrib.auth import get_user_model
from apps.files.models import File

User = get_user_model()

class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminUserSerializer

    def list(self, request):
        """Get all users"""
        users = AdminService.get_all_users()
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get specific user details"""
        try:
            user = User.objects.get(id=pk)
            serializer = AdminUserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, pk=None):
        """Update user details"""
        try:
            updated_user = AdminService.update_user(pk, request.data)
            serializer = AdminUserSerializer(updated_user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        """Delete a user"""
        try:
            AdminService.delete_user(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """Get all files for a specific user"""
        try:
            files = AdminService.get_user_files(pk)
            return Response(files)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['delete'])
    def delete_file(self, request):
        """Delete a file"""
        file_id = request.data.get('file_id')
        if not file_id:
            return Response(
                {"error": "file_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            AdminService.delete_file(file_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except File.DoesNotExist:
            return Response(
                {"error": "File not found"}, 
                status=status.HTTP_404_NOT_FOUND
            ) 