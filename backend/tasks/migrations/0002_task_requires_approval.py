from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("tasks", "0001_initial")]
    operations = [migrations.AddField(model_name="task", name="requires_approval", field=models.BooleanField(default=False))]
