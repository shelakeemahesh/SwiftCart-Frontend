# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enterprise repository standards, CODEOWNERS, issue/PR templates, and governance files.
- Automated CI pipeline with ESLint, Vite build, and containerization.
- React Doctor code health analysis workflow.
- Docker multi-stage build with hardened unprivileged Nginx configuration.
- RBAC route protection (`ProtectedRoute`) with JWT expiration check.
- Global React `ErrorBoundary` with reload action and clean fallback UI.
- Code splitting with `React.lazy` and `Suspense` spinner states.
- Client-side timeout handling via `AbortController` in `apiClient.js`.
- Defensive UI fallbacks across catalog, cart, and dashboard views.
