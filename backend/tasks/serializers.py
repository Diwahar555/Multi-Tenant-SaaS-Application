from django.contrib.auth import get_user_model
from rest_framework import serializers
from organizations.models import Membership
from projects.models import Project
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.none())
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.none(), allow_null=True, required=False)
    assignee_name = serializers.CharField(source="assigned_to.username", read_only=True, default="")
    project_name = serializers.CharField(source="project.name", read_only=True)
    class Meta:
        model = Task
        fields = ("id", "project", "project_name", "title", "description", "assigned_to", "assignee_name", "status", "priority", "requires_approval", "due_date", "completed_at", "created_at", "updated_at")
        read_only_fields = ("id", "project_name", "assignee_name", "completed_at", "created_at", "updated_at")
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        view = self.context.get("view")
        if request and view:
            from organizations.services import get_organization
            org, _ = get_organization(request.user, view.kwargs["org_slug"])
            self.fields["project"].queryset = Project.objects.filter(organization=org)
            self.fields["assigned_to"].queryset = get_user_model().objects.filter(memberships__organization=org)
    def validate(self, attrs):
        task = self.instance
        requires = attrs.get("requires_approval", task.requires_approval if task else False)
        current = attrs.get("status", task.status if task else Task.Status.TODO)
        # Only approval decision endpoints may transition a gated task to done.
        if requires and current == Task.Status.DONE and (not task or task.status != Task.Status.DONE):
            raise serializers.ValidationError({"status": "This task requires an approved workflow request to be completed."})
        if requires and current == Task.Status.DONE and task and not task.requires_approval:
            raise serializers.ValidationError({"requires_approval": "Reopen this task before enabling approvals."})
        return attrs

    def validate_project(self, project):
        if project.status == Project.Status.ARCHIVED:
            raise serializers.ValidationError("You cannot add tasks to an archived project.")
        return project
