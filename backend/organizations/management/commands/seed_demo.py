"""Opt-in demo accounts for local development only."""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from organizations.models import Organization, Membership
from projects.models import Project
from tasks.models import Task
from collaboration.models import TaskComment
from notifications.services import notify
from approvals.models import TaskApproval

class Command(BaseCommand):
    help = "Create a local demo workspace. Never use this in production."
    @transaction.atomic
    def handle(self, *args, **kwargs):
        if not settings.DEBUG:
            raise CommandError("Demo seeding is disabled when DJANGO_DEBUG=False")
        User = get_user_model()
        admin, _ = User.objects.get_or_create(username="demo", defaults={"email": "demo@teamspace.local", "first_name": "Alex"})
        admin.set_password("DemoPass123!")
        admin.save()
        manager, _ = User.objects.get_or_create(username="morgan", defaults={"email": "morgan@teamspace.local", "first_name": "Morgan"})
        manager.set_password("DemoPass123!")
        manager.save()
        member, _ = User.objects.get_or_create(username="jordan", defaults={"email": "jordan@teamspace.local", "first_name": "Jordan"})
        member.set_password("DemoPass123!")
        member.save()
        org, _ = Organization.objects.get_or_create(slug="bright-studio-demo", defaults={"name": "Bright Studio", "created_by": admin})
        for user, role in [(admin, "owner"), (manager, "manager"), (member, "member")]:
            Membership.objects.update_or_create(organization=org, user=user, defaults={"role": role})
        fixture = [
            ("Website Redesign", "Design a modern marketing website", [
                ("Audit current website", "done", "medium", manager),
                ("Create homepage wireframes", "progress", "high", member),
                ("Review UI components", "todo", "high", manager),
                ("Launch landing page", "todo", "medium", member),
            ]),
            ("Mobile App Launch", "Prepare the next product release", [
                ("Finalize onboarding screens", "done", "medium", member),
                ("Run accessibility checks", "progress", "high", manager),
                ("Write release notes", "todo", "medium", member),
            ]),
            ("Content Strategy", "Coordinate new editorial content", [
                ("Publish product announcement", "done", "high", manager),
                ("Draft customer stories", "progress", "low", member),
            ]),
        ]
        from django.utils import timezone
        for name, desc, tasks in fixture:
            project, _ = Project.objects.get_or_create(organization=org, name=name, defaults={"description": desc, "created_by": admin})
            for title, status, priority, assignee in tasks:
                task, created = Task.objects.get_or_create(project=project, title=title, defaults={
                    "status": status, "priority": priority, "assigned_to": assignee, "created_by": admin,
                    "completed_at": timezone.now() if status == "done" else None,
                    "requires_approval": title == "Review UI components",
                })
                if created and title == "Review UI components":
                    TaskComment.objects.create(task=task, author=admin, body="Please check spacing and accessibility before sign-off.")
                    TaskApproval.objects.create(task=task, requested_by=manager, approver=admin, request_note="Ready for your review")
                    notify(org, admin, "approval", "Approval requested", f"{manager.username} requested review of {task.title}", f"/org/{org.slug}/approvals", actor=manager)
        self.stdout.write(self.style.SUCCESS("Demo ready: demo / DemoPass123! (http://localhost:5173)"))
