import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import collaboration.models

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("tasks", "0002_task_requires_approval")]
    operations = [
        migrations.CreateModel(name="TaskComment", fields=[
            ("id", models.BigAutoField(primary_key=True, serialize=False)),
            ("body", models.TextField(max_length=5000)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("updated_at", models.DateTimeField(auto_now=True)),
            ("author", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="tasks.task")),
        ], options={"ordering": ["created_at", "id"]}),
        migrations.CreateModel(name="TaskAttachment", fields=[
            ("id", models.BigAutoField(primary_key=True, serialize=False)),
            ("file", models.FileField(max_length=250, upload_to=collaboration.models.private_path)),
            ("original_name", models.CharField(max_length=200)),
            ("size", models.PositiveIntegerField()),
            ("content_type", models.CharField(max_length=100)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attachments", to="tasks.task")),
            ("uploaded_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
        ], options={"ordering": ["-created_at", "-id"]}),
    ]
