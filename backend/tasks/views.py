from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from organizations.services import get_organization
from auditlogs.services import record
from notifications.services import notify
from .models import Task
from .serializers import TaskSerializer
from .permissions import TaskRolePermission

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, TaskRolePermission]
    serializer_class = TaskSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filterset_fields = ("status", "priority", "project", "assigned_to")
    search_fields = ("title", "description")
    ordering_fields = ("created_at", "due_date", "priority", "updated_at")
    def get_queryset(self):
        org, _ = get_organization(self.request.user, self.kwargs["org_slug"])
        return Task.objects.filter(project__organization=org).select_related("project", "assigned_to")
    def perform_create(self, serializer):
        project = serializer.validated_data["project"]
        completed_at = timezone.now() if serializer.validated_data.get("status") == Task.Status.DONE else None
        task = serializer.save(created_by=self.request.user, completed_at=completed_at)
        record(project.organization, self.request.user, "task.created", task, {"title": task.title})
        if task.assigned_to_id and task.assigned_to_id != self.request.user.pk:
            notify(project.organization, task.assigned_to, "assignment", "Task assigned", f"You were assigned {task.title}", f"/org/{project.organization.slug}/tasks/{task.pk}", actor=self.request.user)
    def perform_update(self, serializer):
        task = serializer.instance
        previous_assignee = task.assigned_to_id
        previous_status = task.status
        new_status = serializer.validated_data.get("status", task.status)
        completed_at = task.completed_at
        if new_status != task.status:
            completed_at = timezone.now() if new_status == Task.Status.DONE else None
        task = serializer.save(completed_at=completed_at)
        from approvals.models import TaskApproval
        if task.requires_approval and previous_status == Task.Status.DONE and task.status != Task.Status.DONE:
            TaskApproval.objects.filter(task=task, status=TaskApproval.Status.APPROVED).update(status=TaskApproval.Status.SUPERSEDED)
        if not task.requires_approval:
            TaskApproval.objects.filter(task=task, status=TaskApproval.Status.PENDING).update(status=TaskApproval.Status.SUPERSEDED)
        if task.assigned_to_id and task.assigned_to_id != previous_assignee and task.assigned_to_id != self.request.user.pk:
            notify(task.project.organization, task.assigned_to, "assignment", "Task assigned", f"You were assigned {task.title}", f"/org/{task.project.organization.slug}/tasks/{task.pk}", actor=self.request.user)
        record(task.project.organization, self.request.user, "task.updated", task, {"title": task.title, "status": task.status})
    def perform_destroy(self, instance):
        record(instance.project.organization, self.request.user, "task.deleted", instance, {"title": instance.title})
        instance.delete()
