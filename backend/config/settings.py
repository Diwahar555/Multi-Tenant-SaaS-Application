"""TeamSpace settings. MYSQL by default, SQLite only when expressly configured for tests/dev."""
import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

def env(name, default=""):
    return os.getenv(name, default)

SECRET_KEY = env("DJANGO_SECRET_KEY", "unsafe-dev-only-change-me")
DEBUG = env("DJANGO_DEBUG", "False").lower() == "true"
if not DEBUG and SECRET_KEY == "unsafe-dev-only-change-me":
    raise RuntimeError("Set a real DJANGO_SECRET_KEY outside debug mode")
ALLOWED_HOSTS = [v.strip() for v in env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if v.strip()]
CSRF_TRUSTED_ORIGINS = [v.strip() for v in env("CSRF_TRUSTED_ORIGINS", "http://localhost:5173").split(",") if v.strip()]
CORS_ALLOWED_ORIGINS = [v.strip() for v in env("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",") if v.strip()]
CORS_ALLOW_CREDENTIALS = True

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "rest_framework", "rest_framework_simplejwt.token_blacklist", "corsheaders",
    "django_filters", "drf_spectacular", "accounts", "organizations",
    "projects", "tasks", "dashboard", "auditlogs", "collaboration", "notifications", "approvals",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [],
    "APP_DIRS": True, "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug", "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"
DATABASES = {"default": {
    "ENGINE": "django.db.backends.mysql", "NAME": env("DB_NAME", "teamspace"),
    "USER": env("DB_USER", "teamspace_user"), "PASSWORD": env("DB_PASSWORD"),
    "HOST": env("DB_HOST", "127.0.0.1"), "PORT": env("DB_PORT", "3306"),
    "OPTIONS": {"charset": "utf8mb4", "init_command": "SET sql_mode='STRICT_TRANS_TABLES'"},
}}
# Uploaded task files are served solely via authenticated DRF views; never expose this directory as static media.
PRIVATE_UPLOAD_ROOT = BASE_DIR / "private_uploads"
MEDIA_ROOT = PRIVATE_UPLOAD_ROOT
MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_PAGINATION_CLASS": "config.pagination.StandardPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend", "rest_framework.filters.SearchFilter", "rest_framework.filters.OrderingFilter"],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle", "rest_framework.throttling.UserRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"anon": "100/hour", "user": "1000/hour"},
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
SPECTACULAR_SETTINGS = {"TITLE": "TeamSpace API", "DESCRIPTION": "Multi-tenant project & task management API", "VERSION": "1.0.0"}
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
REFRESH_COOKIE_SECURE = env("REFRESH_COOKIE_SECURE", "False").lower() == "true"
SESSION_COOKIE_SECURE = REFRESH_COOKIE_SECURE
CSRF_COOKIE_SECURE = REFRESH_COOKIE_SECURE
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") if env("TRUST_PROXY_HTTPS", "False").lower() == "true" else None
