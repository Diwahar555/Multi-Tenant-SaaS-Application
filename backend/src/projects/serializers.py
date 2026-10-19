from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(read_only=True, default=0)
    done_count = serializers.IntegerField(read_only=True, default=0)
    class Meta:
        model = Project
        fields = ("id", "name", "description", "status", "task_count", "done_count", "created_at", "updated_at")
        read_only_fields = ("id", "task_count", "done_count", "created_at", "updated_at")
