from django.shortcuts import get_object_or_404
from .models import Membership

WRITE_ROLES = {"owner", "admin", "manager"}
ADMIN_ROLES = {"owner", "admin"}

def get_organization(user, slug):
    """Never leak tenant existence or contents to non-members (404)."""
    membership = get_object_or_404(
        Membership.objects.select_related("organization"),
        organization__slug=slug, user=user,
    )
    return membership.organization, membership
