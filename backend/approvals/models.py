from django.conf import settings
from django.db import models

class TaskApproval(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        SUPERSEDED = "superseded", "Superseded"
    task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, related_name="approvals")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="approvals_requested")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="approvals_to_review")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    request_note = models.TextField(max_length=2000, blank=True)
    decision_note = models.TextField(max_length=2000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["task", "status"], name="approval_task_status_idx")]
