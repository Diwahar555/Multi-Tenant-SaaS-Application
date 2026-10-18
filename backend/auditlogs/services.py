from .models import ActivityLog

def record(org, actor, action, target=None, details=None):
    return ActivityLog.objects.create(
        organization=org, actor=actor, action=action,
        target_type=target.__class__.__name__.lower() if target else "",
        target_id=target.pk if target else None, details=details or {},
    )
