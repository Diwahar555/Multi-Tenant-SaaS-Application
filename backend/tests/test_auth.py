import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

def test_register_and_http_only_cookie_login_refresh_logout():
    client = APIClient(enforce_csrf_checks=True)
    client.get('/api/v1/auth/csrf/')
    csrf = client.cookies['csrftoken'].value
    response = client.post('/api/v1/auth/register/', {
        'username': 'tester', 'email': 'tester@example.org', 'password': 'some-long-SecurePass!'
    })
    assert response.status_code == 201
    assert get_user_model().objects.filter(username='tester').exists()
    response = client.post('/api/v1/auth/token/', {
        'username': 'tester', 'password': 'some-long-SecurePass!'
    }, HTTP_X_CSRFTOKEN=csrf)
    assert response.status_code == 200
    assert 'access' in response.json()
    assert 'refresh' not in response.json()
    assert client.cookies['teamspace_refresh']['httponly'] is True
    refresh = client.post('/api/v1/auth/token/refresh/', {}, HTTP_X_CSRFTOKEN=csrf)
    assert refresh.status_code == 200
    assert 'access' in refresh.json()
    logout = client.post('/api/v1/auth/logout/', {}, HTTP_X_CSRFTOKEN=csrf)
    assert logout.status_code == 204
    assert not client.cookies['teamspace_refresh'].value

def test_duplicate_email_rejected():
    get_user_model().objects.create_user('original', email='test@example.org', password='SecurePass1!')
    client = APIClient()
    response = client.post('/api/v1/auth/register/', {
        'username':'second', 'email':'TEST@EXAMPLE.ORG', 'password':'SecurePass2!'
    })
    assert response.status_code == 400
