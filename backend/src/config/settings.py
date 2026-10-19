
"""TeamSpace settings for Django and Cloudflare Python Workers."""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

# Load local development variables from backend/.env.
load_dotenv(BASE_DIR / ".env")


def env(name, default=""):
    """Read Worker bindings or local environment variables."""
    try:
        from workers import env as cf_env

        value = getattr(cf_env, name)
        if value is not None:
            return value
    except (ImportError, AttributeError, RuntimeError):
        pass

    return os.getenv(name, default)


# ---------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------

SECRET_KEY = env("DJANGO_SECRET_KEY", "unsafe-dev-only-change-me")

DEBUG = str(env("DJANGO_DEBUG", "False")).lower() == "true"

if not DEBUG and SECRET_KEY == "unsafe-dev-only-change-me":
    raise RuntimeError("Set a real DJANGO_SECRET_KEY outside debug mode")

ALLOWED_HOSTS = [
    value.strip()
    for value in env(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1",
    ).split(",")
    if value.strip()
]

CSRF_TRUSTED_ORIGINS = [
    value.strip()
    for value in env(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if value.strip()
]

CORS_ALLOWED_ORIGINS = [
    value.strip()
    for value in env(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if value.strip()
]

CORS_ALLOW_CREDENTIALS = True


# ---------------------------------------------------------------------
# Django applications
# ---------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "accounts",
    "organizations",
    "projects",
    "tasks",
    "dashboard",
    "auditlogs",
    "collaboration",
    "notifications",
    "approvals",
]


# ---------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ---------------------------------------------------------------------
# URLs and templates
# ---------------------------------------------------------------------

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


# ---------------------------------------------------------------------
# Database
#
# Local development defaults to Django's standard PostgreSQL backend.
# Cloudflare can select django_pg8000 using the DB_ENGINE variable.
# main.py supplies database connection details from Hyperdrive.
# ---------------------------------------------------------------------

DB_ENGINE = str(
    env("DB_ENGINE", "django.db.backends.postgresql")
)

DATABASES = {
    "default": {
        "ENGINE": DB_ENGINE,
        "NAME": env("DB_NAME", "postgres"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT", "5432"),
        "OPTIONS": (
            {"ssl_context": False}
            if DB_ENGINE == "django_pg8000"
            else {"sslmode": env("DB_SSLMODE", "require")}
        ),
        "CONN_MAX_AGE": 0,
    }
}


# ---------------------------------------------------------------------
# Private uploads
# ---------------------------------------------------------------------

PRIVATE_UPLOAD_ROOT = BASE_DIR / "private_uploads"
MEDIA_ROOT = PRIVATE_UPLOAD_ROOT
MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024


# ---------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        )
    },
]


# ---------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "config.pagination.StandardPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
}


# ---------------------------------------------------------------------
# JWT authentication
# ---------------------------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# ---------------------------------------------------------------------
# API documentation
# ---------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "TeamSpace API",
    "DESCRIPTION": "Multi-tenant project & task management API",
    "VERSION": "1.0.0",
}


# ---------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------
# Cookies and HTTPS
# ---------------------------------------------------------------------

REFRESH_COOKIE_SECURE = (
    str(env("REFRESH_COOKIE_SECURE", "False")).lower() == "true"
)

SESSION_COOKIE_SECURE = REFRESH_COOKIE_SECURE
CSRF_COOKIE_SECURE = REFRESH_COOKIE_SECURE

SECURE_PROXY_SSL_HEADER = (
    ("HTTP_X_FORWARDED_PROTO", "https")
    if str(env("TRUST_PROXY_HTTPS", "False")).lower() == "true"
    else None
)


# Production HTTPS security settings
SECURE_SSL_REDIRECT = str(env("SECURE_SSL_REDIRECT", "False")).lower() == "true"
SECURE_HSTS_SECONDS = int(env("SECURE_HSTS_SECONDS", "0"))
