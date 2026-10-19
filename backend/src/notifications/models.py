from django.conf import settings
from django.db import models

class Notification(models.Model):
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="notifications")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="teamspace_notifications")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="sent_teamspace_notifications")
    kind = models.CharField(max_length=40)
    title = models.CharField(max_length=150)
    message = models.CharField(max_length=350, blank=True)
    path = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["recipient", "organization", "read_at"], name="notif_user_org_read_idx")]
