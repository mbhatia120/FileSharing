from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileViewSet, ShareLinkViewSet

router = DefaultRouter()
router.register('files', FileViewSet, basename='file')
router.register('share-links', ShareLinkViewSet, basename='share-link')

urlpatterns = [
    path('', include(router.urls)),
]
