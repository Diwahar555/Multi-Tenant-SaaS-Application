import pytest
from organizations.models import Membership
from approvals.models import TaskApproval
from notifications.models import Notification
from tests.conftest import client_as

pytestmark = pytest.mark.django_db

def test_notifications_are_private_and_mark_read(tenant_setup):
    t=tenant_setup
    owner=client_as(t['alice'])
    url='/api/v1/organizations/one/tasks/'
    response=owner.post(url, {'title':'Assigned task','project':t['project1'].id,'assigned_to':t['charlie'].id})
    assert response.status_code == 201, response.data
    inbox='/api/v1/organizations/one/notifications/'
    member=client_as(t['charlie'])
    results=member.get(inbox)
    assert results.status_code==200
    assert results.data['unread_count']==1
    notification_id=results.data['results'][0]['id']
    assert owner.get(inbox).data['unread_count']==0
    assert owner.patch(f'/api/v1/organizations/one/notifications/{notification_id}/', {'is_read': True}, format='json').status_code==404
    assert member.patch(f'/api/v1/organizations/one/notifications/{notification_id}/', {'is_read': True}, format='json').status_code==200
    assert member.get(inbox).data['unread_count']==0
    assert client_as(t['bob']).get(inbox).status_code==404

def test_approval_gates_completion_and_automatically_completes_after_signoff(tenant_setup):
    t=tenant_setup
    task=t['task1']
    task.requires_approval=True
    task.save(update_fields=['requires_approval'])
    task_url=f'/api/v1/organizations/one/tasks/{task.id}/'
    member=client_as(t['charlie'])
    owner=client_as(t['alice'])
    assert member.patch(task_url, {'status':'done'}, format='json').status_code==400
    assert owner.patch(task_url, {'status':'done'}, format='json').status_code==400
    endpoint=f'/api/v1/organizations/one/tasks/{task.id}/approvals/'
    invalid=member.post(endpoint, {'approver':t['bob'].id}, format='json')
    assert invalid.status_code==400
    result=member.post(endpoint, {'approver':t['alice'].id,'request_note':'Needs sign-off'}, format='json')
    assert result.status_code==201, result.data
    id=result.data['id']
    assert member.post(endpoint, {'approver':t['alice'].id}, format='json').status_code==400
    assert member.patch(f'/api/v1/organizations/one/approvals/{id}/', {'status':'approved'}, format='json').status_code==403
    assert client_as(t['bob']).patch(f'/api/v1/organizations/one/approvals/{id}/', {'status':'approved'}, format='json').status_code==404
    assert owner.patch(f'/api/v1/organizations/one/approvals/{id}/', {'status':'approved'}, format='json').status_code==200
    task.refresh_from_db()
    assert task.status=='done' and task.completed_at is not None
    assert TaskApproval.objects.get(pk=id).status=='approved'
    assert member.get('/api/v1/organizations/one/notifications/').data['unread_count']==1
    assert owner.patch(f'/api/v1/organizations/one/approvals/{id}/', {'status':'approved'}, format='json').status_code==400
    assert owner.patch(task_url, {'status':'progress'}, format='json').status_code==200
    assert TaskApproval.objects.get(pk=id).status=='superseded'
    assert member.patch(task_url, {'status':'done'}, format='json').status_code==400

def test_approval_requires_active_authorized_approver(tenant_setup):
    t=tenant_setup
    task=t['task1']
    task.requires_approval=True;task.save(update_fields=['requires_approval'])
    member=client_as(t['charlie']);owner=client_as(t['alice'])
    result=member.post(f'/api/v1/organizations/one/tasks/{task.pk}/approvals/', {'approver':t['alice'].pk})
    assert result.status_code==201
    approval_id=result.data['id']
    # Removing a membership immediately invalidates permission to approve.
    Membership.objects.filter(user=t['alice'], organization=t['first']).delete()
    assert owner.patch(f'/api/v1/organizations/one/approvals/{approval_id}/', {'status':'approved'}).status_code==404

def test_approval_list_not_leaked_across_tenants(tenant_setup):
    t=tenant_setup
    assert client_as(t['bob']).get('/api/v1/organizations/one/approvals/').status_code==404
    assert client_as(t['alice']).get('/api/v1/organizations/one/approvals/').status_code==200
