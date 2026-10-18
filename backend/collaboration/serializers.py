from rest_framework import serializers
from .models import TaskComment, TaskAttachment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True, default="Deleted user")
    class Meta:
        model = TaskComment
        fields = ("id", "task", "author", "author_name", "body", "created_at", "updated_at")
        read_only_fields = ("id", "task", "author", "author_name", "created_at", "updated_at")
    def validate_body(self, body):
        if not body.strip():
            raise serializers.ValidationError("Comment cannot be empty.")
        return body.strip()

class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True, default="Deleted user")
    class Meta:
        model = TaskAttachment
        fields = ("id", "task", "uploaded_by", "uploaded_by_name", "original_name", "size", "content_type", "created_at")
