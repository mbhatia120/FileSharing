from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import File, FileShare, SecureLink
from .serializers import FileSerializer, FileShareSerializer, SecureLinkSerializer
from apps.authentication.permissions import IsAdmin
from django.db import models 
from rest_framework import serializers 
from django.http import FileResponse 
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.authentication import JWTAuthentication

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = File.objects.all()

    def get_permissions(self):
        """
        Override to allow unauthenticated access to secure links
        """
        if self.action == 'access_secure_link':
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        """
        Extend queryset to include shared files
        """
        user = self.request.user
        # Get files owned by user and shared with user
        return File.objects.filter(
            models.Q(owner=user) | 
            models.Q(shares__shared_with=user)
        ).distinct()

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
        
        # Check if user has permission to access the file
        if file_obj.owner != request.user:
            try:
                share = FileShare.objects.get(
                    file=file_obj, 
                    shared_with=request.user
                )
                # Allow both VIEW and DOWNLOAD permissions to access the file content
                # VIEW permission is needed for previewing files
                if share.permission not in ['VIEW', 'DOWNLOAD']:
                    return Response(
                        {'error': 'Access not permitted'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except FileShare.DoesNotExist:
                return Response(
                    {'error': 'Access not permitted'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        response = FileResponse(
            file_obj.file,
            content_type='application/octet-stream'
        )
        response['Content-Disposition'] = f'attachment; filename="{file_obj.original_name}"'
        return response

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        file = self.get_object()
        
        # Debug logging
        print("Request data:", request.data)
        
        # Check if user is the file owner
        if file.owner != request.user:
            return Response(
                {"error": "You don't have permission to share this file"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create a mutable copy of request.data and add the file
        data = request.data.copy()
        data['file'] = file.id

        serializer = FileShareSerializer(
            data=data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            # Debug logging
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        serializer.save(file=file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def shared_users(self, request, pk=None):
        file = self.get_object()
        if file.owner != request.user:
            return Response(
                {"error": "You don't have permission to view this information"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        shares = FileShare.objects.filter(file=file)
        serializer = FileShareSerializer(shares, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_secure_link(self, request, pk=None):
        file = self.get_object()
        
        # Check if user is the file owner
        if file.owner != request.user:
            return Response(
                {"error": "Only file owner can generate secure links"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create secure link
        secure_link = SecureLink.create_for_file(
            file=file,
            user=request.user,
            expires_in_minutes=60  # 1 hour expiry
        )
        
        secure_url = request.build_absolute_uri(
            f'/api/files/secure-link/{secure_link.id}/'
        )
        
        return Response({
            'secure_url': secure_url,
            'expires_at': secure_link.expires_at
        })

    @action(detail=False, methods=['get'], url_path='secure-link/(?P<link_id>[^/.]+)')
    def access_secure_link(self, request, link_id=None):
        secure_link = get_object_or_404(SecureLink, id=link_id)
        
        # Check if link is expired or used
        if secure_link.is_expired:
            return Response(
                {"error": "Link has expired"},
                status=status.HTTP_410_GONE
            )
        
        if secure_link.is_used:
            return Response(
                {"error": "Link has already been used"},
                status=status.HTTP_410_GONE
            )
        
        # Mark link as used
        secure_link.is_used = True
        secure_link.save()
        
        # Return the file
        response = FileResponse(
            secure_link.file.file,
            content_type=secure_link.file.file_type
        )
        response['X-File-Name'] = secure_link.file.original_name
        response['X-File-Type'] = secure_link.file.file_type
        response['Content-Type'] = secure_link.file.file_type
        response['Content-Disposition'] = f'inline; filename="{secure_link.file.original_name}"'
        response['Access-Control-Expose-Headers'] = 'X-File-Name, X-File-Type, Content-Type, Content-Disposition'
        return response
