from rest_framework import viewsets, permissions
from .models import File, ShareLink
from .serializers import FileSerializer, ShareLinkSerializer
from apps.authentication.permissions import IsAdmin 
from apps.authentication.permissions import IsAdmin

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return File.objects.all()
        return File.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ShareLinkViewSet(viewsets.ModelViewSet):
    serializer_class = ShareLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShareLink.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
