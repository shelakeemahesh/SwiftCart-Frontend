# Contributing to SwiftCart Frontend

Thank you for contributing to SwiftCart Frontend! This document outlines our development workflow, coding guidelines, and pull request procedures.

---

## 🌿 Branching Strategy

- `main` — Production branch. All code in `main` must pass automated CI checks.
- `feat/<feature-name>` — New feature development.
- `fix/<issue-name>` — Bug fixes.
- `chore/<task-name>` — Refactoring, dependency updates, and maintenance.

> **Rule:** Never push directly to `main`. Always branch off `main` and submit a Pull Request.

---

## 🛠️ Local Development & Setup

### Prerequisites
- **Node.js 20+**
- **npm 10+**

### Quick Start
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up environment configuration:
   ```bash
   cp .env.example .env.local
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
   The application runs by default at `http://localhost:5173`.

---

## 🧪 Testing & Verification

Before opening a pull request, verify that both linting and production build compile cleanly:

```bash
# Run ESLint check
npm run lint

# Verify Vite production build
npm run build
```

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(scope): ...` — A new feature or UI component
- `fix(scope): ...` — A bug fix
- `docs(scope): ...` — Documentation only changes
- `style(scope): ...` — Code style/formatting changes
- `refactor(scope): ...` — Code refactoring without behavioral changes
- `chore(scope): ...` — Build, tool, or dependency updates

---

## 🚀 Pull Request Workflow

1. Push your branch to GitHub:
   ```bash
   git push origin <branch-name>
   ```
2. Open a Pull Request targeting `main`.
3. Complete the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
4. Ensure all GitHub Actions CI checks pass.
5. Merge only when review and automated checks are approved.
