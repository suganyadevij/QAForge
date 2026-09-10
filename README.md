# QAForge

A Playwright + TypeScript test automation framework built as a Lead SDET portfolio project. It demonstrates UI and API test automation against a real task-management web application, using the Page Object Model, custom fixtures, network-level mocking, and a Jenkins CI/CD pipeline.

## 1. Project Overview

QAForge automates end-to-end and API testing for a task board application (login, task creation, task completion via drag-and-drop, and full task CRUD through its REST API). The framework is written entirely in TypeScript on top of `@playwright/test`, and is structured to keep test intent, UI interaction logic, API interaction logic, and configuration cleanly separated.

## 2. Key Capabilities

- UI automation using the Page Object Model (`LoginPage`, `TasksPage`)
- API automation with dedicated client classes (`AuthApi`, `TasksApi`) and Bearer token authentication
- Custom Playwright fixtures that inject ready-to-use page objects and an authenticated API client into tests
- Network interception and response mocking to test UI resilience to backend failures
- Tagged tests (`@smoke`, `@regression`) for selective execution
- Multi-project Playwright configuration (`api`, `chromium`, `firefox`, `webkit`)
- CI/CD via a declarative Jenkins Pipeline (`Jenkinsfile`) with secure credential injection

## 3. Technology Stack

| Category | Technology |
|---|---|
| Language | TypeScript |
| Test framework | Playwright Test (`@playwright/test` ^1.63.0) |
| Runtime | Node.js |
| Env config | `dotenv` |
| CI/CD | Jenkins (declarative Pipeline as Code) |
| Reporting | Playwright HTML Reporter, Trace Viewer |

## 4. Framework Architecture

| Layer | Responsibility |
|---|---|
| `tests/` | Test specs only — express *what* is being verified (arrange/act/assert), grouped by `api/` and `ui/` |
| `pages/` | Page Object Model classes — encapsulate locators and UI interactions for a specific page/feature |
| `api/` | API client classes — encapsulate REST calls, request payloads, and auth headers for a specific resource |
| `fixtures/` | Custom Playwright fixtures — wire up and inject page objects / authenticated API clients into tests |
| `utils/` | Shared, reusable test data |
| `playwright.config.ts` | Central configuration — projects, execution strategy, reporter, base URL, and trace settings |

This layering keeps test files free of low-level locator/HTTP details, so tests read as business-readable steps while implementation details live in `pages/` and `api/`.

## 5. Project Structure

```
Playwright-Practice/
├── Jenkinsfile
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── api/
│   ├── AuthApi.ts        # POST /api/auth/login -> access_token
│   └── TasksApi.ts       # create/get/update/delete tasks (Bearer auth)
├── pages/
│   ├── LoginPage.ts      # login form interactions
│   └── TasksPage.ts      # task board interactions (create/complete/delete tasks)
├── fixtures/
│   ├── testFixtures.ts   # injects loginPage, tasksPage into UI tests
│   └── apiFixtures.ts    # injects an authenticated tasksApi into API tests
├── utils/
│   └── testData.ts       # shared static test data
└── tests/
    ├── api/
    │   ├── tasks.api.spec.ts
    │   └── tasks-api-failure.spec.ts
    └── ui/
        ├── login.spec.ts
        ├── task-completion.spec.ts
        └── tasks-create.spec.ts
```

## 6. UI Automation

UI tests drive the task board through two Page Object classes:

- **`LoginPage`** — `navigate()` goes to `/login`; `login(email, password)` fills credentials and submits.
- **`TasksPage`** — encapsulates task board interactions including task creation, completion via drag-and-drop, lookup, and deletion.

## 7. API Automation

API tests use `TasksApi`, a thin REST client over Playwright's `APIRequestContext`:

- `createTask(title, priority?)` → `POST /api/tasks`
- `getTasks()` / `getTask(id)` → `GET /api/tasks[/:id]`
- `updateTask(id, data)` → `PUT /api/tasks/:id`
- `deleteTask(id)` → `DELETE /api/tasks/:id`

Every call is authenticated with a Bearer token obtained via `AuthApi.login()`, which posts `EMAIL`/`PASSWORD` to `POST /api/auth/login` and returns the `access_token`.

## 8. Custom Fixtures

- **`fixtures/testFixtures.ts`** extends the base Playwright `test` with `loginPage` and `tasksPage`, so UI specs receive ready-to-use page objects without constructing them manually.
- **`fixtures/apiFixtures.ts`** extends `test` with `tasksApi`: it logs in via `AuthApi` first and hands the spec an already-authenticated `TasksApi` instance.

## 9. Network Interception & Mocking

`tests/api/tasks-api-failure.spec.ts` uses `page.route('**/api/tasks', ...)` to intercept the board's `GET /api/tasks` call and force a `500` response, then reloads the page. This verifies the UI degrades gracefully on backend failure — the "My Tasks" heading remains visible and all three columns fall back to an empty "No tasks" state instead of crashing or showing a raw error.

## 10. Test Organization

Tests are split by type and tagged for selective runs:

- `tests/api/` — API-only specs (no browser UI), run under the `api` project
- `tests/ui/` — browser-driven specs, run under `chromium` / `firefox` / `webkit`
- `@smoke` — critical-path checks (e.g. login)
- `@regression` — broader functional coverage (task CRUD, completion flow, failure handling)

## 11. Browser & Execution Strategy

Configured Playwright projects (`playwright.config.ts`):

| Project | Test Directory | Notes |
|---|---|---|
| `api` | `./tests/api` | No browser device emulation; used for pure API specs |
| `chromium` | `./tests/ui` | Desktop Chrome — primary browser for CI |
| `firefox` | `./tests/ui` | Desktop Firefox |
| `webkit` | `./tests/ui` | Desktop Safari — configured, but currently has known test failures and is not treated as stable |

Execution behavior:

- `fullyParallel: true` — spec files run in parallel
- `forbidOnly: !!process.env.CI` — build fails if `test.only` is left in on CI
- `retries`: `2` on CI, `0` locally
- `workers`: `1` on CI, default (parallel) locally
- `trace: 'on-first-retry'` — traces are only captured when a test is retried
- `reporter: 'html'` — HTML report generated for every run

## 12. Environment Configuration

Configuration is loaded from environment variables via `dotenv` (`import 'dotenv/config'` in `playwright.config.ts`). Required variables:

| Variable | Purpose |
|---|---|
| `BASE_URL` | Base URL the app under test is served from |
| `EMAIL` | Test account email used for UI login and API auth |
| `PASSWORD` | Test account password used for UI login and API auth |

These are supplied locally via a `.env` file (not committed) and, in CI, injected securely through Jenkins Credentials Binding — no credentials are hard-coded anywhere in the framework.

## 13. Test Commands

npm scripts defined in `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `npm test` | `playwright test --project=api --project=chromium` | Default run: API + Chromium UI tests |
| `npm run test:smoke` | `playwright test --grep @smoke --project=chromium` | Smoke tests on Chromium only |
| `npm run test:regression` | `playwright test --grep @regression --project=api --project=chromium` | Regression suite across API + Chromium |
| `npm run test:all` | `playwright test` | All projects (api, chromium, firefox, webkit) |
| `npm run report` | `playwright show-report` | Opens the last generated HTML report |

## 14. Diagnostics & Reporting

- **HTML Report** — generated automatically after every run (`playwright-report/`), viewable via `npm run report`.
- **Trace Viewer** — traces are captured `on-first-retry`, giving step-by-step timeline, DOM snapshots, and network activity for tests that failed and were retried.

## 15. CI/CD – Jenkins

The `Jenkinsfile` at the repository root defines a declarative Jenkins Pipeline, using Windows-compatible (`bat`) steps:

1. **Checkout** — checks out the repository (`checkout scm`).
2. **Install Dependencies** — `npm install`.
3. **Install Playwright Browser** — `npx playwright install chromium`.
4. **Run Tests** — runs `npx playwright test --project=chromium` with `EMAIL` and `PASSWORD` injected via Jenkins **Credentials Binding** (`withCredentials`/`usernamePassword`), sourced from a Jenkins-managed credential rather than hard-coded — Jenkins automatically masks these values in console output.
5. **Publish Report** — in a `post { always { ... } }` block, the `playwright-report/` directory is archived as a build artifact and, if the report exists, published as a browsable HTML report via the HTML Publisher plugin. This runs regardless of test outcome, so the report is preserved even when the build fails.

A failing Playwright run causes the corresponding pipeline stage — and therefore the whole Jenkins build — to fail; no failures are suppressed.

## 16. What This Project Demonstrates

- Clean separation of concerns via the Page Object Model and API client layers
- Hybrid UI + API test automation in a single framework
- Reusable, typed custom fixtures instead of ad-hoc setup code in tests
- Resilience testing through network-level response mocking
- Tag-based test organization for smoke vs. regression execution
- Secure secrets handling (env vars locally, Jenkins Credentials Binding in CI)
- A working, minimal Pipeline-as-Code setup suitable for a real CI environment

## 17. Application Under Test

The framework targets a task-board web application reachable at the URL configured via `BASE_URL`. The app provides email/password login and a Kanban-style task board (Backlog / In Progress / Done) backed by a REST API (`/api/auth/login`, `/api/tasks`) secured with JWT Bearer authentication, with drag-and-drop task management in the UI.
