import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("tasks", "0002_task_requires_approval")]
    operations = [migrations.CreateModel(name="TaskApproval", fields=[
        ("id", models.BigAutoField(primary_key=True, serialize=False)),
        ("status", models.CharField(choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"), ("superseded", "Superseded")], default="pending", max_length=15)),
        ("request_note", models.TextField(blank=True, max_length=2000)),
        ("decision_note", models.TextField(blank=True, max_length=2000)),
        ("created_at", models.DateTimeField(auto_now_add=True)),
        ("decided_at", models.DateTimeField(blank=True, null=True)),
        ("approver", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="approvals_to_review", to=settings.AUTH_USER_MODEL)),
        ("requested_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="approvals_requested", to=settings.AUTH_USER_MODEL)),
        ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="approvals", to="tasks.task")),
    ], options={"ordering": ["-created_at", "-id"]}),
    migrations.AddIndex(model_name="taskapproval", index=models.Index(fields=["task", "status"], name="approval_task_status_idx"))]
