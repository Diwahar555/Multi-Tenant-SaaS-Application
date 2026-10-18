from rest_framework.permissions import BasePermission, SAFE_METHODS
from organizations.services import get_organization, WRITE_ROLES

class TaskRolePermission(BasePermission):
    def has_permission(self, request, view):
        _, member = get_organization(request.user, view.kwargs["org_slug"])
        if request.method in SAFE_METHODS:
            return True
        if view.action == "partial_update":
            return True  # Per-object member rules enforced below.
        return member.role in WRITE_ROLES
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        _, member = get_organization(request.user, view.kwargs["org_slug"])
        if member.role in WRITE_ROLES:
            return True
        if view.action == "partial_update":
            return obj.assigned_to_id == request.user.id and set(request.data.keys()) == {"status"}
        return False
