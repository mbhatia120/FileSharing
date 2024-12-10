from rest_framework import serializers
from .models import File, FileShare
from django.conf import settings
from django.contrib.auth import get_user_model

class FileSerializer(serializers.ModelSerializer):
    is_shared = serializers.SerializerMethodField()
    shared_by = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ('id', 'original_name', 'file_type', 'size', 
                 'created_at', 'is_shared', 'shared_by', 'permission')
        read_only_fields = ('id', 'created_at', 'is_shared', 'shared_by', 'permission')

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return obj.owner != request.user

    def get_shared_by(self, obj):
        request = self.context.get('request')
        if not request or obj.owner == request.user:
            return None
        try:
            share = obj.shares.get(shared_with=request.user)
            return share.shared_by.email
        except FileShare.DoesNotExist:
            return None

    def get_permission(self, obj):
        request = self.context.get('request')
        if not request or obj.owner == request.user:
            return None
        try:
            share = obj.shares.get(shared_with=request.user)
            return share.permission
        except FileShare.DoesNotExist:
            return None

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

class FileShareSerializer(serializers.ModelSerializer):
    shared_with_email = serializers.EmailField(write_only=True)
    shared_with = serializers.SerializerMethodField()

    class Meta:
        model = FileShare
        fields = ('id', 'file', 'shared_with_email', 'shared_with', 
                 'permission', 'expires_at', 'created_at')
        read_only_fields = ('id', 'shared_by', 'created_at', 'shared_with')
        extra_kwargs = {
            'file': {'required': False}  # Make file field optional in input
        }

    def get_shared_with(self, obj):
        return obj.shared_with.email

    def validate_shared_with_email(self, value):
        User = get_user_model()
        try:
            user = User.objects.get(email=value)
            if user == self.context['request'].user:
                raise serializers.ValidationError("You cannot share a file with yourself")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")

    def create(self, validated_data):
        User = get_user_model()
        shared_with_email = validated_data.pop('shared_with_email')
        shared_with = User.objects.get(email=shared_with_email)
        
        # Check if share already exists
        existing_share = FileShare.objects.filter(
            file=validated_data['file'],
            shared_with=shared_with
        ).first()
        
        if existing_share:
            # Update existing share
            for key, value in validated_data.items():
                setattr(existing_share, key, value)
            existing_share.save()
            return existing_share
            
        return FileShare.objects.create(
            shared_with=shared_with,
            shared_by=self.context['request'].user,
            **validated_data
        )

    def validate(self, attrs):
        # Validate that the permission is valid
        if 'permission' in attrs and attrs['permission'] not in ['VIEW', 'DOWNLOAD']:
            raise serializers.ValidationError({
                'permission': 'Invalid permission value. Must be either VIEW or DOWNLOAD.'
            })
        return attrs
