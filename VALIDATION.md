# Validation and limitations

## Checks completed in this environment

- All backend Python source files were compiled with `python -m compileall` (syntax-level check).
- All React `.jsx`/`.js` source files were parsed with TypeScript's JavaScript/JSX transpiler (syntax-level check).
- No container or alternative database setup is present.
- New Django models and versioned schema migrations are provided for comments/attachments, notifications, approvals and task approval flag.
- Automated API tests have been authored for cross-tenant access, attachments, notifications, RBAC and approvals.

## Not executed here

- Django system checks, `makemigrations --check`, migrations against a live MySQL database, and pytest integration tests.
- An npm dependency installation or complete Vite production build.
- Interactive browser end-to-end checks.

The execution environment cannot download PyPI/npm packages and has no running MySQL server. **Passing syntax checks does not establish runtime correctness or production readiness.** Run the test/build commands in the README on a machine with MySQL and dependencies installed; investigate and fix any results before deployment.
