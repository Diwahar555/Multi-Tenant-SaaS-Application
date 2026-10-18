from rest_framework.permissions import BasePermission, SAFE_METHODS
from organizations.services import get_organization, WRITE_ROLES

class CanManageProjects(BasePermission):
    def has_permission(self, request, view):
        _, membership = get_organization(request.user, view.kwargs["org_slug"])
        return request.method in SAFE_METHODS or membership.role in WRITE_ROLES
