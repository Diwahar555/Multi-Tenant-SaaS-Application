import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from collaboration.models import TaskAttachment
from tests.conftest import client_as

pytestmark = pytest.mark.django_db

def test_comments_are_scoped_and_authorized(tenant_setup):
    t = tenant_setup
    path = f'/api/v1/organizations/one/tasks/{t["task1"].id}/comments/'
    member = client_as(t['charlie'])
    result = member.post(path, {'body':'  Hello team  '})
    assert result.status_code == 201
    comment = result.json()
    assert comment['body'] == 'Hello team'
    assert client_as(t['bob']).get(path).status_code == 404
    assert client_as(t['alice']).get(f'/api/v1/organizations/one/tasks/{t["task2"].id}/comments/').status_code == 404
    assert client_as(t['alice']).patch(f'/api/v1/organizations/one/comments/{comment["id"]}/', {'body':'hijack'}).status_code == 403
    assert client_as(t['bob']).delete(f'/api/v1/organizations/one/comments/{comment["id"]}/').status_code == 404
    assert member.patch(f'/api/v1/organizations/one/comments/{comment["id"]}/', {'body':'edited'}).status_code == 200
    assert member.delete(f'/api/v1/organizations/one/comments/{comment["id"]}/').status_code == 204

def test_private_attachment_validation_and_tenant_download(tenant_setup, settings, tmp_path):
    t=tenant_setup
    settings.MEDIA_ROOT=tmp_path
    path=f'/api/v1/organizations/one/tasks/{t["task1"].pk}/attachments/'
    owner=client_as(t['alice'])
    bad=owner.post(path, {'file':SimpleUploadedFile('danger.exe', b'nope', content_type='application/octet-stream')},format='multipart')
    assert bad.status_code == 400
    uploaded=owner.post(path, {'file':SimpleUploadedFile('notes.txt', b'Hello, team.', content_type='text/plain')},format='multipart')
    assert uploaded.status_code == 201, uploaded.data
    item=uploaded.json()
    assert 'file' not in item  # No public URL to bypass authorization
    id=item['id']
    assert client_as(t['bob']).get(f'/api/v1/organizations/one/attachments/{id}/').status_code == 404
    assert client_as(t['charlie']).get(f'/api/v1/organizations/one/attachments/{id}/').status_code == 200
    assert client_as(t['charlie']).delete(f'/api/v1/organizations/one/attachments/{id}/').status_code == 403
    assert owner.delete(f'/api/v1/organizations/one/attachments/{id}/').status_code == 204
    assert not TaskAttachment.objects.filter(pk=id).exists()

def test_not_member_cannot_upload_to_another_tenants_task(tenant_setup):
    t=tenant_setup
    path=f'/api/v1/organizations/one/tasks/{t["task2"].pk}/attachments/'
    assert client_as(t['alice']).post(path, {'file': SimpleUploadedFile('a.txt', b'hello')},format='multipart').status_code == 404
