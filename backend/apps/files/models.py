from django.db import models
from django.conf import settings
import uuid
import os
from django.utils import timezone
from datetime import timedelta

def get_file_path(instance, filename):
    # Get count of existing files to create incremental filename
    count = File.objects.count() + 1
    ext = os.path.splitext(filename)[1]
    return f'encrypted/file_{count}{ext}'

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    original_name = models.CharField(max_length=255)
    file = models.FileField(upload_to=get_file_path)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_name} ({self.size} bytes)"

class ShareLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()
    can_download = models.BooleanField(default=False)

class FileShare(models.Model):
    class Permissions(models.TextChoices):
        VIEW = 'VIEW', 'View Only'
        DOWNLOAD = 'DOWNLOAD', 'Download'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='shared_files'
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_files'
    )
    permission = models.CharField(
        max_length=10,
        choices=Permissions.choices,
        default=Permissions.VIEW
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('file', 'shared_with')

class SecureLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='secure_links')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @classmethod
    def create_for_file(cls, file, user, expires_in_minutes=60):
        expires_at = timezone.now() + timedelta(minutes=expires_in_minutes)
        return cls.objects.create(
            file=file,
            created_by=user,
            expires_at=expires_at
        )
