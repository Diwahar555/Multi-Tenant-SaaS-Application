import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("organizations", "0001_initial")]
    operations = [
        migrations.CreateModel(name="ActivityLog", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("action", models.CharField(max_length=90)),
            ("target_type", models.CharField(blank=True, max_length=40)),
            ("target_id", models.PositiveBigIntegerField(blank=True, null=True)),
            ("details", models.JSONField(blank=True, default=dict)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("actor", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="activities", to="organizations.organization")),
        ], options={"ordering": ["-created_at", "-id"]}),
    ]
