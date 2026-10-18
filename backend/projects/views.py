from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from organizations.services import get_organization
from auditlogs.services import record
from .models import Project
from .serializers import ProjectSerializer
from .permissions import CanManageProjects

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, CanManageProjects]
    serializer_class = ProjectSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filterset_fields = ("status",)
    search_fields = ("name", "description")
    ordering_fields = ("created_at", "updated_at", "name")
    def get_queryset(self):
        org, _ = get_organization(self.request.user, self.kwargs["org_slug"])
        return Project.objects.filter(organization=org).annotate(
            task_count=Count("tasks"), done_count=Count("tasks", filter=Q(tasks__status="done"))
        )
    def perform_create(self, serializer):
        org, _ = get_organization(self.request.user, self.kwargs["org_slug"])
        project = serializer.save(organization=org, created_by=self.request.user)
        record(org, self.request.user, "project.created", project, {"name": project.name})
    def perform_update(self, serializer):
        project = serializer.save()
        record(project.organization, self.request.user, "project.updated", project, {"name": project.name, "status": project.status})
    def perform_destroy(self, instance):
        record(instance.organization, self.request.user, "project.deleted", instance, {"name": instance.name})
        instance.delete()
