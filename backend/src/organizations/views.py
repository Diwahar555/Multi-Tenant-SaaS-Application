import hashlib
import secrets
import uuid
from datetime import timedelta
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, status, viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from auditlogs.services import record
from .models import Organization, Membership, Invitation
from .services import get_organization, ADMIN_ROLES
from .serializers import OrganizationSerializer, MemberSerializer, InvitationSerializer, CreateInvitationSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer
    lookup_field = "slug"
    http_method_names = ["get", "post", "patch", "head", "options"]
    def get_queryset(self):
        return Organization.objects.filter(memberships__user=self.request.user).distinct().order_by("name")
    @transaction.atomic
    def perform_create(self, serializer):
        name = serializer.validated_data["name"]
        slug = f"{slugify(name)[:48] or 'workspace'}-{uuid.uuid4().hex[:8]}"
        org = serializer.save(slug=slug, created_by=self.request.user)
        Membership.objects.create(organization=org, user=self.request.user, role=Membership.Role.OWNER)
        record(org, self.request.user, "organization.created", org, {"name": org.name})
    def partial_update(self, request, *args, **kwargs):
        org = self.get_object()
        _, member = get_organization(request.user, org.slug)
        if member.role != "owner":
            return Response({"detail": "Only the owner can change organization settings."}, status=403)
        return super().partial_update(request, *args, **kwargs)

class MembersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, org_slug):
        org, _ = get_organization(request.user, org_slug)
        qs = Membership.objects.filter(organization=org).select_related("user").order_by("user__username")
        return Response(MemberSerializer(qs, many=True).data)

class MemberDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def _objects(self, request, org_slug, pk):
        org, actor = get_organization(request.user, org_slug)
        target = get_object_or_404(Membership, pk=pk, organization=org)
        return org, actor, target
    def patch(self, request, org_slug, pk):
        org, actor, target = self._objects(request, org_slug, pk)
        role = request.data.get("role")
        if actor.role not in ADMIN_ROLES:
            return Response({"detail": "Admin access required."}, status=403)
        if target.role == "owner" or role == "owner":
            return Response({"detail": "Ownership cannot be changed here."}, status=403)
        if actor.role == "admin" and (target.role == "admin" or role == "admin"):
            return Response({"detail": "Only an owner can manage admins."}, status=403)
        if role not in ["admin", "manager", "member"]:
            return Response({"role": ["Invalid role."]}, status=400)
        target.role = role
        target.save(update_fields=["role"])
        record(org, request.user, "member.role_changed", target, {"user": target.user.username, "role": role})
        return Response(MemberSerializer(target).data)
    @transaction.atomic
    def delete(self, request, org_slug, pk):
        org, actor, target = self._objects(request, org_slug, pk)
        if actor.role not in ADMIN_ROLES:
            return Response({"detail": "Admin access required."}, status=403)
        if target.role == "owner" or (actor.role == "admin" and target.role == "admin"):
            return Response({"detail": "You cannot remove this member."}, status=403)
        username = target.user.username
        from tasks.models import Task
        # Preserve the invariant that tasks are only assigned to current tenant members.
        Task.objects.filter(project__organization=org, assigned_to=target.user).update(assigned_to=None)
        record(org, request.user, "member.removed", target, {"user": username})
        target.delete()
        return Response(status=204)

class InvitationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, org_slug):
        org, member = get_organization(request.user, org_slug)
        if member.role not in ADMIN_ROLES:
            return Response({"detail": "Admin access required."}, status=403)
        qs = Invitation.objects.filter(organization=org, accepted_at__isnull=True, expires_at__gt=timezone.now())
        return Response(InvitationSerializer(qs, many=True).data)
    def post(self, request, org_slug):
        org, member = get_organization(request.user, org_slug)
        if member.role not in ADMIN_ROLES:
            return Response({"detail": "Admin access required."}, status=403)
        serializer = CreateInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        role = serializer.validated_data["role"]
        if member.role == "admin" and role == "admin":
            return Response({"detail": "Only owners can invite admins."}, status=403)
        if Membership.objects.filter(organization=org, user__email__iexact=email).exists():
            return Response({"email": ["This user is already a member."]}, status=400)
        token = secrets.token_urlsafe(32)
        digest = hashlib.sha256(token.encode()).hexdigest()
        # Supersede older pending links for the same invitee.
        with transaction.atomic():
            Invitation.objects.filter(organization=org, email__iexact=email, accepted_at__isnull=True).delete()
            invitation = Invitation.objects.create(
                organization=org, email=email, role=role, token_hash=digest,
                invited_by=request.user, expires_at=timezone.now() + timedelta(days=7),
            )
        record(org, request.user, "member.invited", invitation, {"email": email, "role": role})
        data = InvitationSerializer(invitation).data
        data["invite_url"] = f"/invite/{token}"
        data["notice"] = "Copy this one-time invitation link now. It is not stored or emailed automatically."
        return Response(data, status=status.HTTP_201_CREATED)

class InvitationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, org_slug, pk):
        org, member = get_organization(request.user, org_slug)
        if member.role not in ADMIN_ROLES:
            return Response({"detail": "Admin access required."}, status=403)
        invitation = get_object_or_404(Invitation, pk=pk, organization=org, accepted_at__isnull=True)
        record(org, request.user, "invitation.revoked", invitation, {"email": invitation.email})
        invitation.delete()
        return Response(status=204)

class AcceptInvitationView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request, token):
        digest = hashlib.sha256(token.encode()).hexdigest()
        invitation = get_object_or_404(Invitation.objects.select_for_update().select_related("organization"), token_hash=digest)
        if not invitation.is_valid:
            return Response({"detail": "This invitation is expired or already used."}, status=400)
        if request.user.email.casefold() != invitation.email.casefold():
            return Response({"detail": "Sign in using the email address that was invited."}, status=403)
        if Membership.objects.filter(user=request.user, organization=invitation.organization).exists():
            return Response({"detail": "You are already a member of this workspace."}, status=400)
        Membership.objects.create(user=request.user, organization=invitation.organization, role=invitation.role)
        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=["accepted_at"])
        record(invitation.organization, request.user, "member.joined", request.user, {"email": request.user.email})
        return Response({"slug": invitation.organization.slug, "name": invitation.organization.name})
