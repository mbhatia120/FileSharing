from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet
from .admin_views import AdminViewSet

router = DefaultRouter()
router.register('', AuthViewSet, basename='auth')
router.register('admin', AdminViewSet, basename='admin')

urlpatterns = [
    path('', include(router.urls)),
    # The google callback will be handled by the viewset action
    # at /api/auth/google_callback/
]
