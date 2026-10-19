from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from accounts.views import CsrfView, LoginView, LogoutView, RefreshView, RegisterView, MeView
from organizations.views import AcceptInvitationView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("api/v1/auth/csrf/", CsrfView.as_view()),
    path("api/v1/auth/register/", RegisterView.as_view()),
    path("api/v1/auth/token/", LoginView.as_view()),
    path("api/v1/auth/token/refresh/", RefreshView.as_view()),
    path("api/v1/auth/logout/", LogoutView.as_view()),
    path("api/v1/me/", MeView.as_view()),
    path("api/v1/invitations/<str:token>/accept/", AcceptInvitationView.as_view()),
    path("api/v1/organizations/", include("organizations.urls")),
]
