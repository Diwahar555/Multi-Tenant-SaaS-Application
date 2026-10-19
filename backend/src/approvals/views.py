from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from organizations.models import Membership
from organizations.services import get_organization, WRITE_ROLES
from tasks.models import Task
from auditlogs.services import record
from notifications.services import notify
from .models import TaskApproval
from .serializers import ApprovalSerializer

class TaskApprovalsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, org_slug, task_id):
        org, _ = get_organization(request.user, org_slug)
        task = get_object_or_404(Task, pk=task_id, project__organization=org)
        return Response(ApprovalSerializer(task.approvals.select_related("requested_by", "approver"), many=True).data)

    @transaction.atomic
    def post(self, request, org_slug, task_id):
        org, member = get_organization(request.user, org_slug)
        task = get_object_or_404(Task.objects.select_for_update(), pk=task_id, project__organization=org)
        if member.role not in WRITE_ROLES and task.assigned_to_id != request.user.pk:
            return Response({"detail": "Only a manager or task assignee can request approval."}, status=403)
        if not task.requires_approval:
            return Response({"detail": "Enable approval required on the task before submitting it."}, status=400)
        if task.status == Task.Status.DONE:
            return Response({"detail": "The task is already complete."}, status=400)
        if task.approvals.filter(status=TaskApproval.Status.PENDING).exists():
            return Response({"detail": "An approval request is already pending."}, status=400)
        approver = get_user_model().objects.filter(pk=request.data.get("approver"), memberships__organization=org, memberships__role__in=WRITE_ROLES).first()
        if not approver:
            return Response({"approver": ["Select a workspace owner, admin, or manager."]}, status=400)
        if approver.pk == request.user.pk:
            return Response({"approver": ["Choose someone other than the requester."]}, status=400)
        note = request.data.get("request_note", "")
        if not isinstance(note, str) or len(note) > 2000:
            return Response({"request_note": ["Maximum 2000 characters."]}, status=400)
        obj = TaskApproval.objects.create(task=task, requested_by=request.user, approver=approver, request_note=note)
        record(org, request.user, "approval.requested", task, {"approval_id": obj.pk, "title": task.title})
        notify(org, approver, "approval", "Approval requested", f"{request.user.username} requested approval for {task.title}", f"/org/{org.slug}/approvals", actor=request.user)
        return Response(ApprovalSerializer(obj).data, status=201)

class ApprovalDecisionView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def patch(self, request, org_slug, pk):
        org, membership = get_organization(request.user, org_slug)
        # Take locks in the same order as new requests (task, then approval).
        existing = get_object_or_404(TaskApproval, pk=pk, task__project__organization=org)
        task = Task.objects.select_for_update().get(pk=existing.task_id)
        obj = get_object_or_404(TaskApproval.objects.select_for_update().select_related("task__project"), pk=pk, task__project__organization=org)
        if not task.requires_approval:
            return Response({"detail": "Approval is no longer required for this task."}, status=400)
        if obj.approver_id != request.user.pk or membership.role not in WRITE_ROLES:
            return Response({"detail": "Only the assigned approver can decide this request."}, status=403)
        if obj.status != TaskApproval.Status.PENDING:
            return Response({"detail": "This approval has already been decided."}, status=400)
        decision = request.data.get("status")
        if decision not in ("approved", "rejected"):
            return Response({"status": ["Use approved or rejected."]}, status=400)
        note = request.data.get("decision_note", "")
        if not isinstance(note, str) or len(note) > 2000:
            return Response({"decision_note": ["Maximum 2000 characters."]}, status=400)
        obj.status = decision
        obj.decision_note = note
        obj.decided_at = timezone.now()
        obj.save(update_fields=["status", "decision_note", "decided_at"])
        if decision == "approved":
            task.status = Task.Status.DONE
            task.completed_at = timezone.now()
            task.save(update_fields=["status", "completed_at", "updated_at"])
        record(org, request.user, f"approval.{decision}", obj.task, {"approval_id": obj.pk, "title": obj.task.title})
        if obj.requested_by_id and obj.requested_by_id != request.user.pk:
            notify(org, obj.requested_by, "approval", f"Request {decision}", f"{request.user.username} {decision} the approval for {obj.task.title}", f"/org/{org.slug}/approvals", actor=request.user)
        return Response(ApprovalSerializer(obj).data)

class ApprovalQueueView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApprovalSerializer
    def get_queryset(self):
        org, _ = get_organization(self.request.user, self.kwargs["org_slug"])
        qs = TaskApproval.objects.filter(task__project__organization=org).select_related("task__project", "requested_by", "approver")
        status = self.request.query_params.get("status")
        if status in ["pending", "approved", "rejected", "superseded"]:
            qs = qs.filter(status=status)
        return qs
