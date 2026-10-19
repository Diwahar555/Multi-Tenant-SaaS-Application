from django.urls import include, path
from .views import OrganizationViewSet, MembersView, MemberDetailView, InvitationsView, InvitationDetailView
from projects.views import ProjectViewSet
from tasks.views import TaskViewSet
from dashboard.views import DashboardView
from auditlogs.views import ActivityListView
from collaboration.views import CommentsView, CommentDetailView, AttachmentsView, AttachmentDetailView
from notifications.views import NotificationListView, NotificationDetailView, MarkAllReadView
from approvals.views import TaskApprovalsView, ApprovalDecisionView, ApprovalQueueView

org_list = OrganizationViewSet.as_view({"get": "list", "post": "create"})
org_detail = OrganizationViewSet.as_view({"get": "retrieve", "patch": "partial_update"})
project_list = ProjectViewSet.as_view({"get": "list", "post": "create"})
project_detail = ProjectViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"})
task_list = TaskViewSet.as_view({"get": "list", "post": "create"})
task_detail = TaskViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"})
urlpatterns = [
    path("", org_list),
    path("<slug:slug>/", org_detail),
    path("<slug:org_slug>/members/", MembersView.as_view()),
    path("<slug:org_slug>/members/<int:pk>/", MemberDetailView.as_view()),
    path("<slug:org_slug>/invitations/", InvitationsView.as_view()),
    path("<slug:org_slug>/invitations/<int:pk>/", InvitationDetailView.as_view()),
    path("<slug:org_slug>/projects/", project_list),
    path("<slug:org_slug>/projects/<int:pk>/", project_detail),
    path("<slug:org_slug>/tasks/", task_list),
    path("<slug:org_slug>/tasks/<int:pk>/", task_detail),
    path("<slug:org_slug>/tasks/<int:task_id>/comments/", CommentsView.as_view()),
    path("<slug:org_slug>/comments/<int:pk>/", CommentDetailView.as_view()),
    path("<slug:org_slug>/tasks/<int:task_id>/attachments/", AttachmentsView.as_view()),
    path("<slug:org_slug>/attachments/<int:pk>/", AttachmentDetailView.as_view()),
    path("<slug:org_slug>/tasks/<int:task_id>/approvals/", TaskApprovalsView.as_view()),
    path("<slug:org_slug>/approvals/", ApprovalQueueView.as_view()),
    path("<slug:org_slug>/approvals/<int:pk>/", ApprovalDecisionView.as_view()),
    path("<slug:org_slug>/notifications/", NotificationListView.as_view()),
    path("<slug:org_slug>/notifications/read-all/", MarkAllReadView.as_view()),
    path("<slug:org_slug>/notifications/<int:pk>/", NotificationDetailView.as_view()),
    path("<slug:org_slug>/dashboard/", DashboardView.as_view()),
    path("<slug:org_slug>/activity/", ActivityListView.as_view()),
]
