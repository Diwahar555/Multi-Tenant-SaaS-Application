import uuid
from pathlib import Path
from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


def private_path(instance, filename):
    # Never use the user-provided filename in the filesystem path.
    return f"task_files/{instance.task_id}/{uuid.uuid4().hex}{Path(filename).suffix.lower()}"

class TaskComment(models.Model):
    task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    body = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at", "id"]

class TaskAttachment(models.Model):
    task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, related_name="attachments")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    file = models.FileField(upload_to=private_path, max_length=250)
    original_name = models.CharField(max_length=200)
    size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

@receiver(post_delete, sender=TaskAttachment)
def cleanup_file(sender, instance, **kwargs):
    if instance.file:
        # Deleting a task or project also removes associated private files.
        instance.file.delete(save=False)
