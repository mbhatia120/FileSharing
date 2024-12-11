from celery import shared_task
from django.utils import timezone
from .models import SecureLink

@shared_task
def cleanup_expired_links():
    """
    Delete expired secure links that are older than 24 hours
    """
    expired_time = timezone.now() - timezone.timedelta(hours=24)
    SecureLink.objects.filter(
        expires_at__lt=timezone.now(),
        created_at__lt=expired_time
    ).delete() 