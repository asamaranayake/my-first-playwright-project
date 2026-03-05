# Session 08: CI/CD Integration — Sample Project

> **Complete working example** demonstrating Playwright CI/CD integration with GitHub Actions, Azure DevOps, Jenkins, and Docker.

---

## 📁 Project Structure

```
session-08-complete/
├── .github/
│   └── workflows/
│       ├── playwright.yml            # Basic GitHub Actions workflow
│       └── playwright-sharded.yml    # Sharded workflow with report merging
├── reporters/
│   └── summary-reporter.ts          # Custom reporter example
├── tests/
│   ├── login.spec.ts                # Login page tests (@smoke)
│   ├── inventory.spec.ts            # Product listing & cart tests
│   ├── checkout.spec.ts             # Checkout flow tests (@smoke)
│   └── retry-demo.spec.ts           # Retry & worker index demonstrations
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── azure-pipelines.yml              # Azure DevOps pipeline
├── docker-compose.yml               # Docker Compose for local CI
├── Dockerfile                       # Custom Playwright Docker image
├── Jenkinsfile                      # Jenkins pipeline
├── package.json                     # NPM scripts & dependencies
├── playwright.config.ts             # CI-optimized Playwright config
├── README.md                        # This file
└── tsconfig.json                    # TypeScript config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Docker (optional, for container exercises)

### Installation
```bash
npm ci
npx playwright install --with-deps
```

### Run Tests
```bash
# Run all tests (local mode)
npm test

# Run in CI mode (dot reporter, 1 worker, 2 retries)
npm run test:ci

# Run headed (see the browser)
npm run test:headed

# Debug mode
npm run test:debug
```

---

## 🧪 Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests with default config |
| `npm run test:ci` | Run with CI environment variable set |
| `npm run test:headed` | Run with browser visible |
| `npm run test:debug` | Run in debug mode |
| `npm run test:shard:1` | Run shard 1 of 4 |
| `npm run test:shard:2` | Run shard 2 of 4 |
| `npm run test:shard:3` | Run shard 3 of 4 |
| `npm run test:shard:4` | Run shard 4 of 4 |
| `npm run test:retries` | Run with 3 retries |
| `npm run report` | Open HTML report |
| `npm run report:merge` | Merge blob reports to HTML |
| `npm run docker:test` | Run tests in official Docker image |
| `npm run docker:build` | Build custom Docker image |
| `npm run docker:run` | Run tests in custom Docker image |

---

## 🏗️ CI/CD Configurations

### GitHub Actions
- **Basic workflow:** `.github/workflows/playwright.yml` — Runs on push/PR, uploads HTML report
- **Sharded workflow:** `.github/workflows/playwright-sharded.yml` — 4 parallel shards with blob report merging

### Azure DevOps
- **Pipeline:** `azure-pipelines.yml` — Runs tests, publishes JUnit results, uploads HTML report

### Jenkins
- **Pipeline:** `Jenkinsfile` — Runs in Docker container with HTML Publisher

### Docker
- **Dockerfile:** Build a custom self-contained test runner
- **docker-compose.yml:** Simulate CI locally with volume-mapped reports

---

## 📊 Reporter Configuration

The `playwright.config.ts` uses environment-aware reporter selection:

| Environment | Reporters |
|-------------|-----------|
| **Local** | `list` (terminal) + `html` (visual) |
| **CI** | `dot` (minimal) + `blob` (for merging) + `junit` (CI integration) |

### Custom Reporter
See `reporters/summary-reporter.ts` for a custom reporter that produces execution summaries.

To use it:
```typescript
// In playwright.config.ts
reporter: [['./reporters/summary-reporter.ts']],
```

---

## 🐳 Docker Usage

### Using the official Playwright image:
```bash
docker run --rm --init --ipc=host \
  -v $(pwd):/app -w /app \
  mcr.microsoft.com/playwright:v1.49.0-noble \
  bash -c "npm ci && npx playwright test"
```

### Using Docker Compose:
```bash
docker compose up --build
```

### Building a custom image:
```bash
docker build -t playwright-session08 .
docker run --rm --init --ipc=host playwright-session08
```

---

## 🔪 Test Sharding

### Run locally:
```bash
# Split into 4 shards and run one
npx playwright test --shard=1/4

# Or use npm scripts
npm run test:shard:1
npm run test:shard:2
npm run test:shard:3
npm run test:shard:4
```

### Merge blob reports:
```bash
# Collect all blob reports into one folder
mkdir all-blob-reports
cp blob-report/* all-blob-reports/

# Merge into HTML
npx playwright merge-reports --reporter html ./all-blob-reports
```

---

## 🔑 Environment Variables

Copy the example and fill in values:
```bash
cp .env.example .env
```

| Variable | Purpose | Default |
|----------|---------|---------|
| `BASE_URL` | Application URL | `https://www.saucedemo.com` |
| `CI` | Enables CI mode | (set by CI providers) |
| `STANDARD_USER` | Test username | `standard_user` |
| `STANDARD_PASSWORD` | Test password | `secret_sauce` |

---

## 📚 Related Resources

- [Lecture Notes: Session 08 — CI/CD Integration](../../LectureNotes/Session08_CICD_Integration/lecture.md)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Playwright Docker Documentation](https://playwright.dev/docs/docker)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [Playwright Sharding](https://playwright.dev/docs/test-sharding)
