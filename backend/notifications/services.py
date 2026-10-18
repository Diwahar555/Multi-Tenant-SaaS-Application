from organizations.models import Membership
from .models import Notification

def notify(org, recipient, kind, title, message, path="", actor=None):
    if not recipient or not Membership.objects.filter(organization=org, user=recipient).exists():
        return None
    return Notification.objects.create(organization=org, recipient=recipient, kind=kind, title=title[:150], message=message[:350], path=path[:300], actor=actor)
