import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from organizations.models import Organization, Membership, Invitation
from projects.models import Project
from tasks.models import Task

pytestmark = pytest.mark.django_db

from tests.conftest import client_as

def test_other_tenant_urls_and_ids_never_expose_data(tenant_setup):
    t = tenant_setup
    alice = client_as(t["alice"])
    assert alice.get("/api/v1/organizations/two/").status_code == 404
    assert alice.get("/api/v1/organizations/two/projects/").status_code == 404
    assert alice.get("/api/v1/organizations/two/tasks/").status_code == 404
    assert alice.get("/api/v1/organizations/two/members/").status_code == 404
    assert alice.get("/api/v1/organizations/two/dashboard/").status_code == 404
    assert alice.get("/api/v1/organizations/two/activity/").status_code == 404
    assert alice.get(f'/api/v1/organizations/one/projects/{t["project2"].pk}/').status_code == 404
    assert alice.get(f'/api/v1/organizations/one/tasks/{t["task2"].pk}/').status_code == 404
    projects = alice.get("/api/v1/organizations/one/projects/").json()["results"]
    assert len(projects) == 1 and projects[0]["id"] == t["project1"].id
    tasks = alice.get("/api/v1/organizations/one/tasks/").json()["results"]
    assert len(tasks) == 1 and tasks[0]["id"] == t["task1"].id

def test_cross_tenant_foreign_keys_rejected(tenant_setup):
    t = tenant_setup
    client = client_as(t["alice"])
    endpoint = "/api/v1/organizations/one/tasks/"
    assert client.post(endpoint, {"title": "Spoof", "project": t["project2"].pk}).status_code == 400
    assert client.post(endpoint, {"title": "Spoof", "project": t["project1"].pk, "assigned_to": t["bob"].pk}).status_code == 400
    assert client.patch(f'{endpoint}{t["task1"].pk}/', {"project": t["project2"].pk}).status_code == 400
    assert client.patch(f'{endpoint}{t["task1"].pk}/', {"assigned_to": t["bob"].pk}).status_code == 400

def test_member_can_only_change_status_of_own_task(tenant_setup):
    t = tenant_setup
    member = client_as(t["charlie"])
    root = "/api/v1/organizations/one/"
    assert member.post(root + "projects/", {"name": "No"}).status_code == 403
    assert member.post(root + "tasks/", {"title": "No", "project": t["project1"].pk}).status_code == 403
    assert member.patch(root + f'tasks/{t["task1"].pk}/', {"status": "done"}).status_code == 200
    t["task1"].refresh_from_db()
    assert t["task1"].completed_at is not None
    assert member.patch(root + f'tasks/{t["task1"].pk}/', {"title": "Hijack"}).status_code == 403
    assert member.patch(root + f'tasks/{t["task2"].pk}/', {"status": "done"}).status_code == 404
    assert member.delete(root + f'tasks/{t["task1"].pk}/').status_code == 403

def test_member_cannot_edit_other_members_task(tenant_setup):
    t = tenant_setup
    other = Task.objects.create(project=t["project1"], title="Someone else's", assigned_to=t["alice"])
    client = client_as(t["charlie"])
    assert client.patch(f"/api/v1/organizations/one/tasks/{other.pk}/", {"status": "done"}).status_code == 403

def test_owner_controls_roles_and_owner_cannot_be_removed(tenant_setup):
    t = tenant_setup
    member = t["first"].memberships.get(user=t["charlie"])
    root = f"/api/v1/organizations/one/members/{member.pk}/"
    assert client_as(t["charlie"]).patch(root, {"role": "admin"}).status_code == 403
    assert client_as(t["alice"]).patch(root, {"role": "manager"}).status_code == 200
    owner_membership = t["first"].memberships.get(user=t["alice"])
    assert client_as(t["alice"]).delete(f"/api/v1/organizations/one/members/{owner_membership.pk}/").status_code == 403
    assert client_as(t["alice"]).patch(root, {"role": "owner"}).status_code == 403

def test_invite_can_only_be_accepted_by_exact_email_once(tenant_setup):
    t = tenant_setup
    owner = client_as(t["alice"])
    email = "new@one.com"
    result = owner.post("/api/v1/organizations/one/invitations/", {"email": email, "role": "member"})
    assert result.status_code == 201
    link = result.json()["invite_url"]
    token = link.rsplit("/", 1)[-1]
    assert owner.post(f"/api/v1/invitations/{token}/accept/").status_code == 403
    newcomer = get_user_model().objects.create_user("newguy", email=email, password="Examplepass123!")
    applicant = client_as(newcomer)
    assert applicant.post(f"/api/v1/invitations/{token}/accept/").status_code == 200
    assert applicant.post(f"/api/v1/invitations/{token}/accept/").status_code == 400
    assert Membership.objects.filter(user=newcomer, organization=t["first"]).exists()

def test_expired_invitation_rejected(tenant_setup):
    import hashlib
    t = tenant_setup
    token = "expired-token"
    Invitation.objects.create(organization=t["first"], email=t["alice"].email, role="member", token_hash=hashlib.sha256(token.encode()).hexdigest(), expires_at=timezone.now()-timedelta(days=1))
    assert client_as(t["alice"]).post(f"/api/v1/invitations/{token}/accept/").status_code == 400

def test_dashboard_scoped_counts(tenant_setup):
    t = tenant_setup
    response = client_as(t["alice"]).get("/api/v1/organizations/one/dashboard/")
    assert response.status_code == 200
    assert response.json()["metrics"]["projects"] == 1
    assert response.json()["metrics"]["tasks"] == 1

def test_removing_member_clears_task_assignments(tenant_setup):
    t = tenant_setup
    member = Membership.objects.get(organization=t["first"], user=t["charlie"])
    result = client_as(t["alice"]).delete(f"/api/v1/organizations/one/members/{member.pk}/")
    assert result.status_code == 204
    t["task1"].refresh_from_db()
    assert t["task1"].assigned_to is None
