from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import File
from .serializers import FileSerializer
from apps.authentication.permissions import IsAdmin
from django.db import models 
from rest_framework import serializers 
from django.http import FileResponse 
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return File.objects.all()
        # Get files owned by user
        return File.objects.filter(owner=user)

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create file instance
        file_instance = File(
            owner=request.user,
            original_name=file_obj.name,
            file=file_obj,
            file_type=file_obj.content_type,
            size=file_obj.size
        )
        
        try:
            file_instance.full_clean()  # Validate model
            file_instance.save()
            
            serializer = self.get_serializer(file_instance)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        file_obj = self.get_object()
        
        # Check if user has download permission
        if file_obj.owner != request.user and not request.user.is_admin():
            return Response(
                {'error': 'Download not permitted'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        response = FileResponse(
            file_obj.file,
            content_type='application/octet-stream'
        )
        response['Content-Disposition'] = f'attachment; filename="{file_obj.original_name}"'
        return response
