import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("organizations", "0001_initial")]
    operations = [migrations.CreateModel(name="Notification", fields=[
        ("id", models.BigAutoField(primary_key=True, serialize=False)),
        ("kind", models.CharField(max_length=40)),
        ("title", models.CharField(max_length=150)),
        ("message", models.CharField(blank=True, max_length=350)),
        ("path", models.CharField(blank=True, max_length=300)),
        ("created_at", models.DateTimeField(auto_now_add=True)),
        ("read_at", models.DateTimeField(blank=True, null=True)),
        ("actor", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="sent_teamspace_notifications", to=settings.AUTH_USER_MODEL)),
        ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to="organizations.organization")),
        ("recipient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="teamspace_notifications", to=settings.AUTH_USER_MODEL)),
    ], options={"ordering": ["-created_at", "-id"]}),
    migrations.AddIndex(model_name="notification", index=models.Index(fields=["recipient", "organization", "read_at"], name="notif_user_org_read_idx"))]
