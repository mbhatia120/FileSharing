from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .google_auth import verify_google_token

class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['register', 'login', 'google_callback']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide both email and password'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(email=email, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'},
                          status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."})
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='google/callback')
    def google_callback(self, request):
        try:
            code = request.data.get('code')
            redirect_uri = request.data.get('redirect_uri')
            
            print("Google callback received:", {
                'code_length': len(code) if code else None,
                'redirect_uri': redirect_uri,
                'request_headers': dict(request.headers),
                'request_data': request.data
            })
            
            if not code or not redirect_uri:
                return Response(
                    {'error': 'Missing required parameters'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                user_info = verify_google_token(code, redirect_uri)
                print("User info received:", user_info)
                
                user = User.objects.filter(email=user_info['email']).first()
                
                if not user:
                    user = User.objects.create_user(
                        email=user_info['email'],
                        password=None,
                        is_active=True,
                        google_id=user_info.get('sub'),
                        picture=user_info.get('picture')
                    )
                    print(f"Created new user: {user.email}")
                else:
                    print(f"Found existing user: {user.email}")
                
                refresh = RefreshToken.for_user(user)
                response_data = {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                print("Sending response:", response_data)
                
                return Response(response_data)
                
            except ValueError as e:
                print(f"Value Error in Google callback: {str(e)}")
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print(f"Unexpected error in Google callback: {str(e)}")
            return Response(
                {'error': 'Authentication failed', 'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
