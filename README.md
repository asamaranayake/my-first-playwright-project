# Session 07: Authentication & Storage State — Complete Sample Project

## 📋 Overview

This project demonstrates Playwright's **authentication and storage state** capabilities. Instead of logging in before every test, we authenticate **once** and reuse the saved state across all tests, dramatically reducing test execution time.

**Target Application:** [SauceDemo](https://www.saucedemo.com/)

---

## 📁 Project Structure

```
session-07-complete/
├── src/
│   └── pages/                           # Page Object Models
│       ├── LoginPage.ts                      # Login page interactions
│       └── InventoryPage.ts                  # Inventory/products page interactions
├── tests/
│   └── e2e/
│       ├── auth/                        # 🔐 Auth setup files (run first)
│       │   ├── admin.setup.ts                # Login as admin → saves admin.json
│       │   └── user.setup.ts                 # Login as user → saves user.json
│       └── ui/                          # 🧪 Test files (use saved auth)
│           ├── admin-inventory.spec.ts       # Tests running as admin (6 tests)
│           ├── user-inventory.spec.ts        # Tests running as user (6 tests)
│           ├── login-page.spec.ts            # Login page tests with NO auth (8 tests)
│           ├── multi-role-interaction.spec.ts # Both roles in single tests (4 tests)
│           └── multi-role-pom.spec.ts        # POM + auth fixture tests (7 tests)
├── fixtures/
│   ├── auth-fixtures.ts                 # adminPage & userPage fixtures
│   └── auth-pom-fixtures.ts             # adminInventory & userInventory POM fixtures
├── playwright/
│   └── .auth/                           # 💾 Saved auth states (git-ignored)
│       └── .gitkeep
├── playwright.config.ts                 # Config with 6 projects
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Create the auth directory
mkdir -p playwright/.auth

# 4. Run all tests (setup projects run automatically first)
npm test
```

---

## 📦 Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (setup + all projects) |
| `npm run test:setup` | Run only the auth setup files |
| `npm run test:admin` | Run admin role tests only |
| `npm run test:user` | Run standard user tests only |
| `npm run test:login` | Run login page tests (no auth) |
| `npm run test:multi-role` | Run multi-role interaction tests |
| `npm run test:report` | Generate and open HTML report |
| `npm run clean:auth` | Delete saved auth state files |

---

## 🏗️ Project Architecture

### Projects in `playwright.config.ts`

| Project | Type | Auth State | Dependencies |
|---------|------|------------|--------------|
| `admin-setup` | Setup | Generates `admin.json` | None |
| `user-setup` | Setup | Generates `user.json` | None |
| `admin-tests` | Tests | Uses `admin.json` | `admin-setup` |
| `user-tests` | Tests | Uses `user.json` | `user-setup` |
| `login-tests` | Tests | Empty (no auth) | None |
| `multi-role-tests` | Tests | Creates own contexts | `admin-setup`, `user-setup` |

### Execution Flow

```
npx playwright test
        │
   ┌────┴────┐
   ▼         ▼
admin.setup  user.setup      ← Setup projects run first (in parallel)
   │         │
   ▼         ▼
admin.json   user.json       ← Auth states saved to disk
   │         │
   ▼         ▼
admin-tests  user-tests      ← Run after their setup completes
             │
             ▼
        login-tests           ← Runs independently (no setup needed)
             │
             ▼
       multi-role-tests       ← Runs after both setups complete
```

---

## 🔑 Key Concepts

### 1. Storage State

`browserContext.storageState()` saves **cookies** and **localStorage** to a JSON file. When loaded into a new context via `storageState: 'path/to/file.json'`, the browser starts in that authenticated state.

### 2. Setup Projects

Setup projects run **before** test projects. They are configured with `testMatch: /.*\.setup\.ts/` and referenced via `dependencies: ['setup-name']`.

### 3. Role-Based Testing

Different user roles (admin, standard user) get separate setup files and storage state files. Each test project loads the appropriate auth state.

### 4. Skipping Auth

Use `test.use({ storageState: { cookies: [], origins: [] } })` or configure a project with empty state to test pages that should be accessed without authentication.

### 5. Auth Fixtures

Custom fixtures (`adminPage`, `userPage`) create separate BrowserContexts with different auth states, allowing multi-role testing within a single test.

---

## 🔐 SauceDemo Users

| Username | Password | Description |
|----------|----------|-------------|
| `standard_user` | `secret_sauce` | Normal user (used as admin) |
| `performance_glitch_user` | `secret_sauce` | Slow load times (used as standard user) |
| `locked_out_user` | `secret_sauce` | Cannot login |
| `problem_user` | `secret_sauce` | UI glitches |
| `error_user` | `secret_sauce` | Server errors |
| `visual_user` | `secret_sauce` | Visual bugs |

---

## 💡 Tips

- **Never commit auth files** — `playwright/.auth/` is in `.gitignore`
- **Setup runs once per test run** — Even if you run multiple test projects
- **Auth files can expire** — Use `npm run clean:auth` to force re-authentication
- **Performance:** API-based auth is faster than UI login for setup
- **Session storage** is NOT saved by `storageState` — handle it manually if needed

---

## 📖 Session Notes

See the [Session 07 Lecture Notes](../../LectureNotes/Session07_Authentication/lecture.md) for comprehensive coverage of authentication patterns, exercises, and quizzes.
