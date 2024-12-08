from rest_framework import serializers
from .models import File, ShareLink

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'name', 'file', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class ShareLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareLink
        fields = ('id', 'file', 'expires_at', 'can_download')
        read_only_fields = ('id',)
