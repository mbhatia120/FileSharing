from rest_framework import serializers
from .models import File
from django.conf import settings

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'original_name', 'file_type', 'size', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        file_obj = self.context['request'].FILES.get('file')
        if not file_obj:
            raise serializers.ValidationError("No file was submitted")

        # Validate file size
        if file_obj.size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"File size cannot exceed {settings.MAX_UPLOAD_SIZE/1024/1024}MB")

        # Validate file type
        if file_obj.content_type not in settings.ALLOWED_MIME_TYPES:
            raise serializers.ValidationError(
                f"File type {file_obj.content_type} is not supported")

        return attrs
