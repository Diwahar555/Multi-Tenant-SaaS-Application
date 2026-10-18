from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegisterSerializer, UserSerializer

COOKIE = "teamspace_refresh"
COOKIE_PATH = "/api/v1/auth/"

def set_refresh_cookie(response, token):
    from django.conf import settings
    response.set_cookie(
        COOKIE, str(token), max_age=7 * 24 * 3600, path=COOKIE_PATH,
        httponly=True, secure=settings.REFRESH_COOKIE_SECURE, samesite="Lax",
    )

def delete_refresh_cookie(response):
    response.delete_cookie(COOKIE, path=COOKIE_PATH, samesite="Lax")

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"csrfToken": get_token(request)})

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # Email is accepted as a login alias without modifying Django's User model.
        from django.contrib.auth import get_user_model
        username = request.data.get("username", "")
        if "@" in username:
            found = get_user_model().objects.filter(email__iexact=username).first()
            if found:
                username = found.get_username()
        user = authenticate(request, username=username, password=request.data.get("password", ""))
        if user is None or not user.is_active:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        update_last_login(None, user)
        response = Response({"access": str(refresh.access_token), "user": UserSerializer(user).data})
        set_refresh_cookie(response, refresh)
        return response

@method_decorator(csrf_protect, name="dispatch")
class RefreshView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        cookie = request.COOKIES.get(COOKIE)
        if not cookie:
            return Response({"detail": "Missing refresh cookie."}, status=401)
        serializer = TokenRefreshSerializer(data={"refresh": cookie})
        serializer.is_valid(raise_exception=True)
        response = Response({"access": serializer.validated_data["access"]})
        if "refresh" in serializer.validated_data:
            set_refresh_cookie(response, serializer.validated_data["refresh"])
        return response

@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        cookie = request.COOKIES.get(COOKIE)
        if cookie:
            try:
                RefreshToken(cookie).blacklist()
            except TokenError:
                pass
        response = Response(status=204)
        delete_refresh_cookie(response)
        return response

class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user
