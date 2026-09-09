# Multi-Tenant SaaS Application

A full-stack **Multi-Tenant SaaS application** built with **Django REST Framework and React**. The application supports tenant-isolated data, JWT authentication, role-based access control, team management, seat limits, audit logging, and task management.

## 🚀 Features

* 🔐 JWT-based authentication
* 🏢 Multi-tenant workspace architecture
* 👥 Team and user management
* 🛡️ Role-based access control
* 🔒 Tenant-level data isolation
* 📋 Task management
* 📊 Workspace dashboard
* 👤 Admin, Manager, and Member roles
* 💺 Tenant seat-limit enforcement
* 📝 Audit logging
* 🐘 PostgreSQL support
* 🗄️ SQLite support for local development
* 🐳 Docker support
* ⚙️ GitHub Actions CI
* 🔍 Bandit security scanning
* 🔐 pip-audit dependency scanning
* ⚛️ React + Vite frontend

---

## 🛠️ Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* PostgreSQL
* SQLite
* Gunicorn
* Docker

### Frontend

* React
* Vite
* JavaScript
* React Router
* Context API
* Fetch API

---

## 🏗️ Architecture

The application uses a **shared database, shared schema** multi-tenant architecture.

Each tenant-owned record is associated with a tenant through a foreign key.

```text
                    ┌───────────────┐
                    │    Tenant     │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
          ┌────────┐   ┌────────┐   ┌──────────┐
          │ Users  │   │ Tasks  │   │ AuditLog │
          └────────┘   └────────┘   └──────────┘
```

Tenant isolation is enforced at the backend using:

* Tenant-aware middleware
* Tenant-scoped ORM queries
* Permission classes
* Object-level access control
* Automated isolation tests

---

## 📂 Project Structure

```text
multi-tenant-saas/
│
├── backend/
│   ├── config/
│   ├── core/
│   ├── tenants/
│   ├── accounts/
│   ├── tasks/
│   ├── tests/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── vite.config.js
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd multi-tenant-saas
```

---

# Backend Setup

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

---

## 4. Configure Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DEBUG=True
SECRET_KEY=your-secret-key

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

SQLite can be used for local development when PostgreSQL variables are not configured.

---

## 5. Run Migrations

```bash
cd backend
python manage.py migrate
```

---

## 6. Create Superuser

```bash
python manage.py createsuperuser
```

---

## 7. Start Backend

```bash
python manage.py runserver
```

Backend:

```text
http://localhost:8000
```

API:

```text
http://localhost:8000/api/
```

---

# Frontend Setup

## 8. Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

---

## 9. Configure API URL

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 10. Start Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🐳 Docker

The backend includes Docker configuration for running Django with PostgreSQL.

```bash
cd backend
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

---

# 🔑 Authentication

Users authenticate using:

```text
Workspace Slug
Email
Password
```

The API returns JWT tokens after successful authentication.

Example:

```http
POST /api/auth/login/
```

```json
{
    "tenant_slug": "acme",
    "email": "admin@example.com",
    "password": "StrongPassword123"
}
```

Authenticated requests use:

```http
Authorization: Bearer <access_token>
```

---

# 👥 User Roles

| Role    | Permissions               |
| ------- | ------------------------- |
| Admin   | Full workspace management |
| Manager | Team and task management  |
| Member  | Standard workspace access |

---

# 🔒 Multi-Tenant Data Isolation

Tenant isolation is a core security feature.

For example:

```text
Tenant A
├── User A
├── User B
└── Task A

Tenant B
├── User C
├── User D
└── Task B
```

A user belonging to **Tenant A cannot access Tenant B's data**, even when attempting to directly access another object's ID.

This protection is implemented on the backend and does not depend on frontend restrictions.

---

# 📋 Task Management

Users can:

* Create tasks
* View tasks
* Update tasks
* Delete tasks
* Manage task status

Example API:

```http
GET    /api/tasks/
POST   /api/tasks/
PATCH  /api/tasks/<id>/
DELETE /api/tasks/<id>/
```

---

# 👤 Team Management

Workspace administrators can:

* View team members
* Add team members
* Assign roles
* Manage workspace users
* Enforce tenant seat limits

---

# 🧪 Testing

Run Django tests:

```bash
cd backend
python manage.py test
```

Tenant isolation tests verify that users cannot access data belonging to another tenant.

---

# 🔍 Security

The project includes automated security checks.

### Bandit

```bash
bandit -r .
```

### pip-audit

```bash
pip-audit -r requirements.txt
```

GitHub Actions can run these checks automatically during development.

---

# 📸 Screenshots

Add application screenshots here after deployment.

Example:

```markdown
## Screenshots

### Login

![Login](screenshots/login.png)

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Task Management

![Tasks](screenshots/tasks.png)

### Team Management

![Team](screenshots/team.png)
```

---

# 🔮 Future Improvements

* Stripe subscription and billing
* Subscription plans
* Email invitations
* Password reset
* OAuth authentication
* Advanced audit-log dashboard
* Notifications
* Pagination and filtering
* API documentation with Swagger/OpenAPI
* Redis caching
* Celery background jobs
* Production monitoring
* Usage-based billing

---

# 📄 License

This project is available for learning, portfolio, and development purposes.

---

## 👨‍💻 Author

**V Diwahar**

Built with ❤️ using **Django REST Framework + React**.
