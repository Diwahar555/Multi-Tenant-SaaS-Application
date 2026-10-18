from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from organizations.services import get_organization
from .models import Notification
from rest_framework import serializers

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "kind", "title", "message", "path", "created_at", "read_at")

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    def get_queryset(self):
        org, _ = get_organization(self.request.user, self.kwargs["org_slug"])
        return Notification.objects.filter(organization=org, recipient=self.request.user)
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        unread = queryset.filter(read_at__isnull=True).count()
        response = super().list(request, *args, **kwargs)
        response.data["unread_count"] = unread
        return response

class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, org_slug, pk):
        org, _ = get_organization(request.user, org_slug)
        note = get_object_or_404(Notification, pk=pk, recipient=request.user, organization=org)
        if set(request.data.keys()) != {"is_read"} or not isinstance(request.data["is_read"], bool):
            return Response({"is_read": ["Provide true or false."]}, status=400)
        note.read_at = timezone.now() if request.data["is_read"] else None
        note.save(update_fields=["read_at"])
        return Response(NotificationSerializer(note).data)

class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, org_slug):
        org, _ = get_organization(request.user, org_slug)
        count = Notification.objects.filter(organization=org, recipient=request.user, read_at__isnull=True).update(read_at=timezone.now())
        return Response({"updated": count})
