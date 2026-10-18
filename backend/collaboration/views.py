from pathlib import Path
from django.conf import settings
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from organizations.services import get_organization, ADMIN_ROLES
from tasks.models import Task
from auditlogs.services import record
from notifications.services import notify
from .models import TaskComment, TaskAttachment
from .serializers import CommentSerializer, AttachmentSerializer

ALLOWED_EXTENSIONS = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".pdf": "application/pdf", ".txt": "text/plain"}

def get_task(user, org_slug, task_id):
    org, membership = get_organization(user, org_slug)
    return org, membership, get_object_or_404(Task.objects.select_related("project", "assigned_to"), pk=task_id, project__organization=org)

def validate_upload(file):
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return "Use PNG, JPG, PDF or UTF-8 TXT files."
    if file.size == 0 or file.size > settings.MAX_ATTACHMENT_BYTES:
        return "File must be between 1 byte and 10 MB."
    prefix = file.read(8)
    file.seek(0)
    if ext == ".png" and prefix != b"\x89PNG\r\n\x1a\n":
        return "Invalid PNG file."
    if ext in (".jpg", ".jpeg") and not prefix.startswith(b"\xff\xd8\xff"):
        return "Invalid JPG file."
    if ext == ".pdf" and not prefix.startswith(b"%PDF-"):
        return "Invalid PDF file."
    if ext == ".txt":
        try:
            if b"\x00" in file.read():
                return "Invalid text file."
            file.seek(0)
            # Reject invalid UTF-8 to avoid unexpected content types.
            file.read().decode("utf-8")
        except UnicodeDecodeError:
            return "Text file must be UTF-8."
        finally:
            file.seek(0)
    return None

class CommentsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, org_slug, task_id):
        _, _, task = get_task(request.user, org_slug, task_id)
        return Response(CommentSerializer(task.comments.select_related("author"), many=True).data)
    def post(self, request, org_slug, task_id):
        org, _, task = get_task(request.user, org_slug, task_id)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(task=task, author=request.user)
        record(org, request.user, "task.commented", task, {"comment_id": comment.id, "title": task.title})
        if task.assigned_to_id and task.assigned_to_id != request.user.id:
            notify(org, task.assigned_to, "comment", "New task comment", f"{request.user.username} commented on {task.title}", f"/org/{org.slug}/tasks/{task.pk}", actor=request.user)
        return Response(CommentSerializer(comment).data, status=201)

class CommentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get_comment(self, request, org_slug, pk):
        org, member = get_organization(request.user, org_slug)
        comment = get_object_or_404(TaskComment.objects.select_related("task__project"), pk=pk, task__project__organization=org)
        return org, member, comment
    def patch(self, request, org_slug, pk):
        _, _, comment = self.get_comment(request, org_slug, pk)
        if comment.author_id != request.user.pk:
            return Response({"detail": "Only the author can edit this comment."}, status=403)
        serializer = CommentSerializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    def delete(self, request, org_slug, pk):
        org, member, comment = self.get_comment(request, org_slug, pk)
        if comment.author_id != request.user.pk and member.role not in ADMIN_ROLES:
            return Response({"detail": "Only the author or an admin can delete this comment."}, status=403)
        record(org, request.user, "comment.deleted", comment.task, {"comment_id": comment.pk})
        comment.delete()
        return Response(status=204)

class AttachmentsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    def get(self, request, org_slug, task_id):
        _, _, task = get_task(request.user, org_slug, task_id)
        return Response(AttachmentSerializer(task.attachments.select_related("uploaded_by"), many=True).data)
    def post(self, request, org_slug, task_id):
        org, _, task = get_task(request.user, org_slug, task_id)
        file = request.FILES.get("file")
        if not file:
            return Response({"file": ["Select a file."]}, status=400)
        error = validate_upload(file)
        if error:
            return Response({"file": [error]}, status=400)
        name = Path(file.name).name[:200]
        attachment = TaskAttachment.objects.create(task=task, uploaded_by=request.user, file=file, original_name=name, size=file.size, content_type=ALLOWED_EXTENSIONS[Path(file.name).suffix.lower()])
        record(org, request.user, "attachment.added", task, {"attachment_id": attachment.pk, "filename": attachment.original_name})
        return Response(AttachmentSerializer(attachment).data, status=201)

class AttachmentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get_attachment(self, request, org_slug, pk):
        org, member = get_organization(request.user, org_slug)
        attachment = get_object_or_404(TaskAttachment.objects.select_related("task__project"), pk=pk, task__project__organization=org)
        return org, member, attachment
    def get(self, request, org_slug, pk):
        _, _, attachment = self.get_attachment(request, org_slug, pk)
        try:
            attachment.file.open("rb")
            response = FileResponse(attachment.file, as_attachment=True, filename=attachment.original_name, content_type="application/octet-stream")
            response["X-Content-Type-Options"] = "nosniff"
            response["Cache-Control"] = "no-store"
            return response
        except FileNotFoundError:
            return Response({"detail": "File was not found on storage."}, status=404)
    def delete(self, request, org_slug, pk):
        org, member, attachment = self.get_attachment(request, org_slug, pk)
        if attachment.uploaded_by_id != request.user.pk and member.role not in ADMIN_ROLES:
            return Response({"detail": "Only the uploader or an admin can delete this attachment."}, status=403)
        record(org, request.user, "attachment.deleted", attachment.task, {"attachment_id": attachment.pk})
        attachment.delete()
        return Response(status=204)
