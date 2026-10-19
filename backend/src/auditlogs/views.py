from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from organizations.services import get_organization
from .models import ActivityLog

class ActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.username", read_only=True, default="System")
    class Meta:
        model = ActivityLog
        fields = ("id", "actor_name", "action", "target_type", "target_id", "details", "created_at")

class ActivityListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer
    def get_queryset(self):
        org, _ = get_organization(self.request.user, self.kwargs["org_slug"])
        return ActivityLog.objects.filter(organization=org).select_related("actor")
