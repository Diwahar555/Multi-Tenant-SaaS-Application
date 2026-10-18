from rest_framework import serializers
from .models import TaskApproval

class ApprovalSerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source="task.title", read_only=True)
    project_name = serializers.CharField(source="task.project.name", read_only=True)
    requester_name = serializers.CharField(source="requested_by.username", read_only=True, default="Deleted user")
    approver_name = serializers.CharField(source="approver.username", read_only=True, default="Deleted user")
    class Meta:
        model = TaskApproval
        fields = ("id", "task", "task_name", "project_name", "requested_by", "requester_name", "approver", "approver_name", "status", "request_note", "decision_note", "created_at", "decided_at")
        read_only_fields = fields
