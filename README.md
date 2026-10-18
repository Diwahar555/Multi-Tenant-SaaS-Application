# TeamSpace — Multi-Tenant Project & Task Management SaaS

Full-stack Django + DRF + React.js + MySQL application. Separate companies use private workspaces; tenant filters and role permissions are enforced by the **Django REST API**, not only in React.

**Application stack:** Python 3.12+, Django 5.2, Django REST Framework, REST APIs, React.js 19, JavaScript, and MySQL 8+. Vite/Node.js serve and build the React application; Django uses a few Python authentication, filtering, documentation and testing packages. No container setup or alternate database is included.

This is a **developer/portfolio project**, not a certified production service. Dependencies must be installed and runtime tests run in your environment. See security notes before handling real customer data.

## Implemented modules

| # | Module | Priority | Implemented features |
|---|---|---|---|
| 1 | Authentication | P0 | Register, login, JWT access, HTTP-only refresh cookie rotation, logout, profile |
| 2 | Organization management | P0 | Create organization, list/switch workspaces, rename workspace |
| 3 | Tenant security & RBAC | P0 | Owner/Admin/Manager/Member roles; tenant-scoped querysets, nested ID validation |
| 4 | Employee invitations | P1 | Expiring, one-time invitation links; accept/revoke; member role and removal |
| 5 | Project management | P1 | Create/read/update/delete, status/archive, search, filters, progress |
| 6 | Kanban task management | P1 | To do / In progress / Done; draggable cards; create/assign/prioritize/filter, due dates |
| 7 | Task comments & attachments | P1 | Discuss/edit/delete comments; upload and authenticated download/delete of private files |
| 8 | Notification system | P1 | In-app inbox for task assignments, comments and approval updates; mark read/all read |
| 9 | Activity & audit logs | P2 | Organization activity timeline and audit events for important changes |
| 10 | Approval workflows | P2 | Approval-required tasks, request reviewer, approve/reject, decision history, automatic completion on approval |
| 11 | Dashboard & analytics | — | Workload, project progress, completions, overdue tasks, pending approvals, unread count |

**Boundaries:** Invitations return a link to copy and share: no outbound email service. Notifications are in-app only, not SMS/email/push. Attachments are stored privately on disk (not public URLs). Approvals gate completion **only when a task has `requires_approval=true`**. There is no billing module.

## 1. Install MySQL and create the database

Install MySQL Server 8+, create a local MySQL instance, then run this from MySQL Workbench or the MySQL command line as an administrator:

```sql
CREATE DATABASE teamspace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'teamspace_user'@'127.0.0.1' IDENTIFIED BY 'choose-a-strong-local-password';
GRANT ALL PRIVILEGES ON teamspace.* TO 'teamspace_user'@'127.0.0.1';
```

If your MySQL instance uses socket auth or a different host, update the database host and user accordingly. Django uses **MySQL exclusively** for the database. Installing `mysqlclient` may require MySQL C development headers and a C compiler.

To run the Django test suite, the MySQL user must also have access to a separate test database created automatically by Django (for example, grant `CREATE` on an appropriate local MySQL test setup or pre-create `test_teamspace` with grants). Do not use production customer databases for automated tests.

## 2. Run the Django backend

Open a terminal in the `backend` folder.

**Windows PowerShell:**

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env` and set the MySQL username/password you created and a random `DJANGO_SECRET_KEY`. For example, generate one with Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Then, from the `backend` folder:

```bash
python manage.py check
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Django API: **http://127.0.0.1:8000/api/v1/**  
API schema: **http://127.0.0.1:8000/api/schema/**  
Interactive API documentation: **http://127.0.0.1:8000/api/docs/**

Uploaded files are placed under `backend/private_uploads/` and served only from an authenticated API endpoint. Back up this directory alongside the MySQL database if using persistent data.

## 3. Run the React frontend

Open a **separate** terminal in the `frontend` folder, with Node.js 22+ and npm installed:

```bash
npm install
npm run dev
```

Visit **http://localhost:5173**. The Vite development server proxies `/api` to the Django server on port `8000`, so auth cookies and API requests work without changing frontend URLs.

To produce a production frontend build (separate hosting configuration required):

```bash
npm run build
```

## 4. Optional local demo accounts

With the backend `.env` set to `DJANGO_DEBUG=True` (local development only):

```bash
cd backend
python manage.py seed_demo
```

Accounts: `demo` (Owner), `morgan` (Manager), and `jordan` (Member), all with password `DemoPass123!`. Demo includes multiple projects, tasks, an example discussion, an approval request and a notification. The command refuses to run outside debug mode. Never deploy these credentials.

You can instead register your own user and create an organization from the React app.

## Roles and tenant security

| Action | Owner | Admin | Manager | Member |
|---|:---:|:---:|:---:|:---:|
| Read projects/tasks, comment, attach files | Yes | Yes | Yes | Yes |
| Create/manage projects and all tasks | Yes | Yes | Yes | No |
| Change status of assigned tasks | Yes | Yes | Yes | Yes |
| Invite/remove standard members | Yes | Yes | No | No |
| Manage admins or organization settings | Yes | No | No | No |
| Request approvals on assigned tasks | Yes | Yes | Yes | Yes |
| Decide approvals assigned to themselves | Yes | Yes | Yes | No |
| Read and mark **own** notifications | Yes | Yes | Yes | Yes |

Project/task IDs, comment/attachment IDs, approval IDs and member IDs are all resolved **within the requested organization and authenticated member context**. A known ID from another company results in `404`. Assignments and approvers must be valid members of the same organization.

A task can require approval (`requires_approval=true`). Direct changes to `done` via the task API are rejected; the requester selects an Owner/Admin/Manager reviewer (not themselves). Approval by the selected reviewer moves the task to `done`, saves `completed_at` and audits the decision. Reopening such a task supersedes its previous approval. Rejected requests can be resubmitted.

## REST API endpoints

All API paths are under `/api/v1/`. Except account creation, login, CSRF setup, refresh and logout, endpoints require `Authorization: Bearer ACCESS_TOKEN`.

| Method | Route | Purpose |
|---|---|---|
| GET | `auth/csrf/` | Initialize CSRF protection |
| POST | `auth/register/` | Register account |
| POST | `auth/token/` | Log in; return access token and set refresh cookie |
| POST | `auth/token/refresh/` | Rotate refresh token |
| POST | `auth/logout/` | Logout and blacklist refresh token |
| GET, PATCH | `me/` | Own profile |
| GET, POST | `organizations/` | List and create workspaces |
| GET, PATCH | `organizations/{slug}/` | Workspace details/settings |
| GET | `organizations/{slug}/members/` | Organization members |
| PATCH, DELETE | `organizations/{slug}/members/{id}/` | Change role/remove member |
| GET, POST | `organizations/{slug}/invitations/` | Pending invitations/create link |
| DELETE | `organizations/{slug}/invitations/{id}/` | Revoke invitation |
| POST | `invitations/{token}/accept/` | Join invited workspace |
| GET, POST | `organizations/{slug}/projects/` | List/create projects |
| GET, PATCH, DELETE | `organizations/{slug}/projects/{id}/` | Project actions |
| GET, POST | `organizations/{slug}/tasks/` | List/create tasks |
| GET, PATCH, DELETE | `organizations/{slug}/tasks/{id}/` | Task actions |
| GET, POST | `organizations/{slug}/tasks/{task_id}/comments/` | List/post task comments |
| PATCH, DELETE | `organizations/{slug}/comments/{id}/` | Edit/delete authorized comment |
| GET, POST | `organizations/{slug}/tasks/{task_id}/attachments/` | List/upload multipart attachments |
| GET, DELETE | `organizations/{slug}/attachments/{id}/` | Authenticated private download/delete |
| GET, POST | `organizations/{slug}/tasks/{task_id}/approvals/` | Approval history/request |
| GET | `organizations/{slug}/approvals/` | Paginated approval queue (`status` filter) |
| PATCH | `organizations/{slug}/approvals/{id}/` | Approve/reject request |
| GET | `organizations/{slug}/notifications/` | Own notification inbox and unread count |
| PATCH | `organizations/{slug}/notifications/{id}/` | Mark personal notification read/unread |
| POST | `organizations/{slug}/notifications/read-all/` | Read all own notifications |
| GET | `organizations/{slug}/dashboard/` | Analytics |
| GET | `organizations/{slug}/activity/` | Audit log |

Lists of projects, tasks, approvals, notifications and activity are paginated. Comments and attachments return arrays per individual task. Attachments accept `multipart/form-data` with key `file`, supported formats PNG/JPG/PDF/UTF-8 TXT and max size 10 MB. File downloads require Bearer auth (the React UI handles this).

## Run tests and verify migrations

Start MySQL and make sure your local test account has test-database privileges. From `backend`:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
pytest -q
```

From `frontend`:

```bash
npm run build
```

The backend test suite covers authentication, tenant isolation, member roles, invitations, task assignments, private attachment access, comment access, notifications, approvals, approval gating and dashboard data.

## Project structure

```text
teamspace-saas/
├── backend/
│   ├── accounts/          JWT, login/register and user profile
│   ├── organizations/     Workspaces, RBAC, members and invitations
│   ├── projects/          Project REST API
│   ├── tasks/             Task REST API and Kanban statuses
│   ├── collaboration/     Task comments and private attachments
│   ├── notifications/     User-scoped inbox and notification creation
│   ├── approvals/         Request/review approval workflows
│   ├── auditlogs/         Activity history
│   ├── dashboard/         Organization analytics
│   ├── config/            Django configuration and routing
│   ├── tests/             pytest-django integration tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/pages/         UI for all eleven modules
│   ├── src/api/           REST API client
│   ├── src/contexts/      Authentication and workspace state
│   ├── src/components/    Shared UI and navigation
│   └── package.json
└── README.md
```

## Production considerations

This release is for a local/resume demonstration. Before serving external tenants, add verified email ownership (the current invitation acceptance checks only the self-registered email), password reset, MFA or equivalent account security, outbound invitations if needed, file malware scanning, file retention/quotas, object-storage integration if deploying multiple backend instances, and comprehensive production security/load testing.

Use HTTPS, rotate secrets, set `DJANGO_DEBUG=False`, restrict hosts/CORS/CSRF origins, set `REFRESH_COOKIE_SECURE=True`, configure a proper TLS reverse proxy for your chosen host, and take encrypted MySQL and private-file backups. Do not expose the database to the public network. Short-lived JWT access tokens are kept in React memory and refresh tokens are stored in HTTP-only cookies.
