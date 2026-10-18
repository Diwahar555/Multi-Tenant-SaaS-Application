import os
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from organizations.models import Organization, Membership
from projects.models import Project
from tasks.models import Task

os.environ.setdefault("DJANGO_DEBUG", "True")
os.environ.setdefault("DJANGO_SECRET_KEY", "test-only-not-for-production")

@pytest.fixture
def tenant_setup():
    User = get_user_model()
    alice = User.objects.create_user("alice", email="alice@one.com", password="Passw0rd!user")
    bob = User.objects.create_user("bob", email="bob@two.com", password="Passw0rd!user")
    charlie = User.objects.create_user("charlie", email="charlie@one.com", password="Passw0rd!user")
    first = Organization.objects.create(name="One", slug="one", created_by=alice)
    second = Organization.objects.create(name="Two", slug="two", created_by=bob)
    Membership.objects.create(organization=first, user=alice, role="owner")
    Membership.objects.create(organization=first, user=charlie, role="member")
    Membership.objects.create(organization=second, user=bob, role="owner")
    project1 = Project.objects.create(organization=first, name="Private One", created_by=alice)
    project2 = Project.objects.create(organization=second, name="Private Two", created_by=bob)
    task1 = Task.objects.create(project=project1, title="Mine", assigned_to=charlie)
    task2 = Task.objects.create(project=project2, title="Theirs", assigned_to=bob)
    return locals()

def client_as(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client
