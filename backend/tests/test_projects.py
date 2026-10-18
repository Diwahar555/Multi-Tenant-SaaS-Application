import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from organizations.models import Membership, Organization

pytestmark = pytest.mark.django_db

def test_create_org_makes_owner_and_project_has_valid_tenant():
    user = get_user_model().objects.create_user('owner', email='owner@example.com', password='StrongPass789!')
    client = APIClient()
    client.force_authenticate(user)
    response = client.post('/api/v1/organizations/', {'name':'Design Crew'})
    assert response.status_code == 201
    slug = response.json()['slug']
    org = Organization.objects.get(slug=slug)
    assert Membership.objects.get(organization=org, user=user).role == 'owner'
    res = client.post(f'/api/v1/organizations/{slug}/projects/', {'name':'Project A', 'organization':99999})
    assert res.status_code == 201
    assert org.projects.get().name == 'Project A'
    assert org.projects.get().created_by == user
