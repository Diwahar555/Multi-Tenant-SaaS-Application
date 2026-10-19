from datetime import timedelta
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from organizations.models import Membership
from organizations.services import get_organization
from projects.models import Project
from tasks.models import Task
from approvals.models import TaskApproval
from notifications.models import Notification

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, org_slug):
        org, _ = get_organization(request.user, org_slug)
        projects = Project.objects.filter(organization=org)
        tasks = Task.objects.filter(project__organization=org)
        today = timezone.localdate()
        trend = []
        for ago in reversed(range(7)):
            day = today - timedelta(days=ago)
            trend.append({"date": day.isoformat(), "completed": tasks.filter(completed_at__date=day).count()})
        summary = projects.annotate(total=Count("tasks"), done=Count("tasks", filter=Q(tasks__status="done")))
        workload = (
            tasks.filter(assigned_to__isnull=False)
            .values("assigned_to__username").annotate(total=Count("id"), done=Count("id", filter=Q(status="done")))
            .order_by("-total")[:8]
        )
        return Response({
            "metrics": {
                "projects": projects.count(),
                "active_projects": projects.filter(status="active").count(),
                "tasks": tasks.count(),
                "completed": tasks.filter(status="done").count(),
                "overdue": tasks.filter(due_date__lt=today).exclude(status="done").count(),
                "members": Membership.objects.filter(organization=org).count(),
                "pending_approvals": TaskApproval.objects.filter(task__project__organization=org, status="pending").count(),
                "my_unread_notifications": Notification.objects.filter(organization=org, recipient=request.user, read_at__isnull=True).count(),
            },
            "trend": trend,
            "projects": [{"id": p.id, "name": p.name, "status": p.status, "total": p.total, "done": p.done} for p in summary[:5]],
            "workload": [{"name": w["assigned_to__username"], "total": w["total"], "done": w["done"]} for w in workload],
        })
