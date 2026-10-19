import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("organizations", "0001_initial")]
    operations = [
        migrations.CreateModel(name="Project", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=200)),
            ("description", models.TextField(blank=True)),
            ("status", models.CharField(choices=[("active", "Active"), ("completed", "Completed"), ("archived", "Archived")], default="active", max_length=20)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("updated_at", models.DateTimeField(auto_now=True)),
            ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="projects", to="organizations.organization")),
        ], options={"ordering": ["-updated_at", "-id"]}),
        migrations.AddIndex(model_name="project", index=models.Index(fields=["organization", "status"], name="projects_org_status_idx")),
    ]
