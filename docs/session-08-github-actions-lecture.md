---
marp: true
theme: gaia
class: lead
paginate: true
backgroundColor: #fff
color: #222
header: 'Session 08 — Playwright + GitHub Actions'
footer: 'Akila Samaranayake · Playwright Training'
style: |
  section { font-size: 26px; }
  h1 { color: #2E86AB; }
  h2 { color: #A23B72; }
  table { font-size: 22px; margin: 0 auto; }
  code { background: #f4f4f8; padding: 2px 6px; border-radius: 4px; }
  pre { font-size: 18px; }
  .small { font-size: 18px; }
  .big { font-size: 34px; }
  .center { text-align: center; }
---

<!-- _class: lead -->

# Playwright + GitHub Actions
## From Zero to CI/CD in One Session

**Audience:** Beginners — never touched CI before
**Goal:** Run Playwright tests on GitHub on demand & on a schedule
**Format:** Concepts → Demo → Hands-on

---

## Agenda

| # | Topic | Time |
|---|---|---|
| 1 | Why CI/CD? (Mental Model) | 5 min |
| 2 | Anatomy of a GitHub Actions YAML file | 10 min |
| 3 | Workflow #1 — Manual single run | 15 min |
| 4 | Workflow #2 — Sharded parallel run | 15 min |
| 5 | Workflow #3 — Docker container speed-up | 10 min |
| 6 | Debugging failed runs & downloading artifacts | 10 min |
| 7 | Using GitHub's starter templates | 5 min |
| 8 | Hands-on Lab | 20 min |

---

# Part 1 — Why CI/CD?

---

## The Problem CI Solves

```
Without CI                          With CI
─────────                          ─────────
"Works on my machine"  ────►       "Works on a fresh Linux VM"
Manual test runs                    Auto-runs on schedule/button
Forgot to run tests                 Can't forget — robot runs them
Slow regression testing             4 parallel shards = 4× faster
No history                          Every run logged forever
```

> **CI = Robots running your tests on someone else's computer, automatically.**

---

## What is GitHub Actions?

<div class="center big">

GitHub Actions = Free CI/CD robots living inside GitHub

</div>

```
┌──────────────────────────────────────────────────────────┐
│ 1. You write a YAML file → .github/workflows/*.yml      │
│ 2. You push it to GitHub                                 │
│ 3. GitHub sees it → shows up in "Actions" tab            │
│ 4. Trigger fires (manual, push, schedule…)              │
│ 5. GitHub spins up a fresh Ubuntu VM                     │
│ 6. Runs your steps in order                              │
│ 7. Saves results (artifacts, logs) → VM destroyed       │
└──────────────────────────────────────────────────────────┘
```

**Free tier:** 2,000 minutes/month for private repos · unlimited for public.

---

# Part 2 — Anatomy of a Workflow File

---

## The 5 Building Blocks

```yaml
name: Playwright Tests              # 1. Display name in UI

on:                                 # 2. WHEN to run
  workflow_dispatch:                #    (manual button)

jobs:                               # 3. WHAT machines to spin up
  test:
    runs-on: ubuntu-latest          # 4. WHICH OS
    steps:                          # 5. WHAT commands to run
      - uses: actions/checkout@v5   #    (uses = pre-made action)
      - run: npm test               #    (run = shell command)
```

| Block | Purpose | Example |
|---|---|---|
| `name` | Label in Actions UI | `Playwright Tests` |
| `on` | Trigger | `push`, `schedule`, `workflow_dispatch` |
| `jobs` | One or more machines | `test:`, `build:`, `deploy:` |
| `runs-on` | OS | `ubuntu-latest`, `windows-latest` |
| `steps` | Sequential commands | `checkout`, `npm install`, `test` |

---

## Triggers (`on:`) — The Most Important Concept

| Trigger | When it fires | Use case |
|---|---|---|
| `push` | Every git push | Verify every commit |
| `pull_request` | PR opened/updated | Gate merges |
| `workflow_dispatch` | **Manual button click** | On-demand runs |
| `schedule` (cron) | Recurring timer | Nightly regression |
| `repository_dispatch` | External API call | Webhooks |

**In this lesson we use only `workflow_dispatch` + `schedule`** — no push/PR triggers.

> Why? You want students to click the button themselves and watch what happens.

---

## Cron Syntax in 60 Seconds

```
┌───────── minute (0–59)
│ ┌─────── hour (0–23, UTC)
│ │ ┌───── day-of-month (1–31)
│ │ │ ┌─── month (1–12)
│ │ │ │ ┌─ day-of-week (0–6, Sun=0)
│ │ │ │ │
0 2 * * *    →  Every day at 02:00 UTC
0 3 * * 1    →  Every Monday at 03:00 UTC
*/15 * * * * →  Every 15 minutes
```

🛠 Use [**crontab.guru**](https://crontab.guru) to design & validate.

---

# Part 3 — Workflow #1: Manual Single Run

`.github/workflows/playwright.yml`

---

## What This Workflow Does

```
┌─────────────────────────────────────────────────────┐
│  Trigger:  🖱  Click "Run workflow"  OR  ⏰ daily 2am │
│                                                      │
│  Steps:                                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ 1. Checkout repo (download code)               │ │
│  │ 2. Setup Node.js                               │ │
│  │ 3. npm install                                 │ │
│  │ 4. Install Playwright browsers                 │ │
│  │ 5. Run tests (with your filters)               │ │
│  │ 6. Upload HTML report as artifact              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Output: 📦 playwright-report.zip (30-day retention) │
└─────────────────────────────────────────────────────┘
```

---

## Inputs (Form Fields)

When you click "Run workflow", you see a form:

| Field | What it does | Example |
|---|---|---|
| `grep` | Filter tests by name/tag | `@smoke` |
| `project` | Pick a Playwright project | `chromium` |
| `headed` | Run in headed mode | ☐ |

These map to the test command:

```bash
npx playwright test --grep "@smoke" --project=chromium
```

---

## The YAML Walkthrough (Part 1)

```yaml
name: Playwright Tests (Manual)

on:
  workflow_dispatch:
    inputs:
      grep:
        description: 'Tag/pattern to filter tests'
        required: false
        default: ''
  schedule:
    - cron: '0 2 * * *'
```

| Line | Meaning |
|---|---|
| `workflow_dispatch:` | Adds the manual "Run workflow" button |
| `inputs:` | Form fields shown before run |
| `schedule:` | Also runs automatically nightly |

---

## The YAML Walkthrough (Part 2)

```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env: { CI: 'true' }
```

> Every step starts from a **clean Ubuntu VM** — that's why we re-install everything every time.

---

## Why `--with-deps`?

```
npx playwright install          → downloads browser binaries
npx playwright install --with-deps → ALSO installs OS libraries
                                     (fonts, codecs, GTK, etc.)
```

**Without `--with-deps`** on a fresh CI box you get errors like:
```
error while loading shared libraries: libnss3.so: cannot open shared object
```

✅ Always use `--with-deps` on CI (apt-get under the hood).

---

# Part 4 — Workflow #2: Sharded Parallel Run

`.github/workflows/playwright-sharded.yml`

---

## The Sharding Idea

```
You have 100 tests. One machine takes 20 minutes.

Option A: One big runner          Option B: 4 parallel runners (sharded)
┌──────────────────┐               ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ All 100 tests    │               │ 25  │ │ 25  │ │ 25  │ │ 25  │
│ 20 min ⏱        │               │tests│ │tests│ │tests│ │tests│
└──────────────────┘               │ 5min│ │ 5min│ │ 5min│ │ 5min│
                                   └─────┘ └─────┘ └─────┘ └─────┘
                                   Total: ~5 min ⚡
```

Playwright's built-in flag does the split:
```bash
npx playwright test --shard=2/4   # "I am runner #2 of 4"
```

---

## Three-Stage Pipeline

```
        ┌──────────────────┐
        │  Job 1: setup    │   builds the matrix list
        │  → [1,2,3,4]     │
        └────────┬─────────┘
                 ↓
   ┌─────┬──────┴──────┬─────┐
   ↓     ↓             ↓     ↓
 ┌───┐ ┌───┐         ┌───┐ ┌───┐
 │ 1 │ │ 2 │   …     │ 3 │ │ 4 │   Job 2: playwright-tests (matrix)
 │   │ │   │         │   │ │   │   Each uploads a "blob" artifact
 └─┬─┘ └─┬─┘         └─┬─┘ └─┬─┘
   │     │             │     │
   └─────┴──────┬──────┴─────┘
                ↓
        ┌──────────────────┐
        │ Job 3: merge-    │   downloads all blobs
        │ reports          │   → one unified HTML
        └──────────────────┘
```

---

## Matrix Strategy — One Job, Many Runners

```yaml
strategy:
  fail-fast: false              # don't cancel siblings if one fails
  matrix:
    shardIndex: [1, 2, 3, 4]    # spawns 4 parallel jobs
```

The same `steps:` block runs **4 times in parallel**, with
`${{ matrix.shardIndex }}` taking values `1, 2, 3, 4`.

```yaml
- run: npx playwright test --shard=${{ matrix.shardIndex }}/4
```

---

## Why a "Setup" Job First?

| Without setup job | With setup job |
|---|---|
| `matrix: [1,2,3,4]` (hardcoded) | `matrix: fromJson(...)` (dynamic) |
| Input `shardTotal=6` still runs 4 shards 😬 | Input `shardTotal=6` runs 6 shards ✅ |

```yaml
setup:
  outputs:
    shardIndices: ${{ steps.matrix.outputs.shardIndices }}
  steps:
    - run: |
        total="${{ inputs.shardTotal || 4 }}"
        echo "shardIndices=$(seq 1 $total | jq -cs '.')" >> $GITHUB_OUTPUT
```

Then: `matrix: shardIndex: ${{ fromJson(needs.setup.outputs.shardIndices) }}`

---

## Blob Reports → Merged HTML

```
Shard 1 → blob-report-1/  ┐
Shard 2 → blob-report-2/  │   download-artifact (merge-multiple: true)
Shard 3 → blob-report-3/  ├─────────────────────┐
Shard 4 → blob-report-4/  ┘                     │
                                                 ↓
                              npx playwright merge-reports --reporter html
                                                 ↓
                                       playwright-report/ (full HTML)
```

This is the report you actually open after a sharded run.

---

# Part 5 — Workflow #3: Docker Container

`.github/workflows/playwright-docker.yml`

---

## The Problem

Every workflow run wastes ~90 seconds installing browsers:

```
Setup Node       ████ 15s
npm install      ████████ 30s
Install browsers ██████████████████████████ 90s  ← repeated every run
Run tests        ████████████ 45s
```

**With 4 sharded runners × 90s = 6 minutes of pure waste per run.**

---

## The Fix — Run Inside a Pre-Built Image

Microsoft publishes images that already contain Node + all browsers + all deps:

```
mcr.microsoft.com/playwright:v1.57.0-noble
                              └────┬────┘ └─┬─┘
                       Playwright version   Ubuntu Noble (24.04)
```

⚠️ **Version pinning is critical** — must match `@playwright/test` in `package.json`.

---

## Comparing Workflows Side-by-Side

| Step | `playwright.yml` (bare Ubuntu) | `playwright-docker.yml` (container) |
|---|:---:|:---:|
| Checkout repo | ✅ | ✅ |
| Setup Node | ✅ ~15s | ❌ (in image) |
| `npm install / ci` | ✅ ~30s | ✅ ~10s |
| Install browsers | ✅ ~90s | ❌ (in image) |
| Run tests | ✅ | ✅ |
| Upload artifact | ✅ | ✅ |
| **Total overhead** | **~2 min** | **~10-30s** |
| **Reproducibility** | Depends on apt | Pinned image hash |

---

## The Magic Line

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.57.0-noble
    steps:
      - uses: actions/checkout@v5
      - run: npm ci
      - run: npx playwright test
```

That's it — the entire job runs **inside** the Docker image.
No `setup-node`, no `playwright install`.

---

## `npm install` vs `npm ci`

| Command | Behavior | When to use |
|---|---|---|
| `npm install` | Reads `package.json`, updates lockfile | Local dev |
| `npm ci` | Strict install from `package-lock.json`, errors on mismatch | **CI** |

Faster + reproducible + catches lockfile drift bugs.

---

# Part 6 — Debugging & Artifacts

---

## Anatomy of the Actions Tab

```
GitHub repo → "Actions" tab

┌────────────────────────────────────────────────────────┐
│ All workflows                                          │
│ ─────────────                                          │
│ ▸ Playwright Tests (Manual)         ← left sidebar    │
│ ▸ Playwright Tests (Sharded)                          │
│ ▸ Playwright Tests (Docker)                           │
│                                                        │
│ Workflow runs                                          │
│ ─────────────                                          │
│ 🟢 #42  Manual run on main          2 min ago         │
│ 🔴 #41  Scheduled nightly           8 hours ago       │
│ 🟡 #40  Manual run (in progress)    1 min ago         │
└────────────────────────────────────────────────────────┘
```

Status colors: 🟡 running · 🟢 passed · 🔴 failed · ⚪ cancelled

---

## Debugging a Failed Run

```
1. Click the failed run (🔴)
2. Click the failed job in the left panel
3. Expand the failed step (red X next to step name)
4. Read logs top-to-bottom
```

| Symptom | Where to look |
|---|---|
| Test assertion failed | "Run Playwright tests" step → scroll up to first error |
| Browser missing | Did you forget `--with-deps`? Wrong image version? |
| YAML error | Top of run page: "Invalid workflow file" + line number |
| Step took forever | Each step shows duration on the right |
| Need more detail | Re-run with **"Re-run with debug logging"** |

---

## Re-Running

Top-right of any failed run:

| Button | What it does |
|---|---|
| **Re-run all jobs** | Fresh start — all jobs from scratch |
| **Re-run failed jobs** | Only retry the broken matrix shards |
| **Re-run with debug logging** | Verbose logs (sets `ACTIONS_RUNNER_DEBUG=true`) |

⚡ Pro tip: For flaky tests, "Re-run failed jobs" saves 75% of CI minutes on a 4-shard workflow.

---

## Artifacts — Where Reports Live

Scroll to the **bottom** of any completed run's summary page:

```
┌─────────────────────────────────────────────┐
│  Artifacts                                  │
│  ─────────────────                          │
│  📦 playwright-report      45.2 MB    ⬇   │
│  📦 blob-report-1           2.1 MB    ⬇   │
│  📦 blob-report-2           1.8 MB    ⬇   │
└─────────────────────────────────────────────┘
```

---

## Opening a Report Locally

```bash
# 1. Download the zip from the Artifacts section
# 2. Unzip
unzip playwright-report.zip -d report

# 3. Open the interactive report
npx playwright show-report report
```

You'll see:
- ✅ Pass/fail per test
- 📸 Screenshots on failure
- 🎬 Videos
- 🔍 **Trace viewer** — step-by-step replay with DOM snapshots

> Trace viewer is the #1 reason to use Playwright on CI — it's a time machine for failures.

---

# Part 7 — Using GitHub's Starter Templates

---

## The Template Page

URL: `https://github.com/<owner>/<repo>/actions/new?category=continuous-integration`

```
┌───────────────────────────────────────────────────────────┐
│  Get started with GitHub Actions                          │
│                                                           │
│  Suggested for this repository:                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ ▶ Playwright    │  │ ▶ Node.js        │             │
│  │   [Configure]    │  │   [Configure]    │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                           │
│  Continuous integration:                                  │
│  Python · Go · Rust · Java · .NET · Docker · CodeQL …    │
└───────────────────────────────────────────────────────────┘
```

GitHub auto-detects your `package.json` and suggests relevant templates.

---

## How to Use It

| Step | Action |
|---|---|
| 1 | Open the URL above |
| 2 | Click **Configure** on a template card |
| 3 | Web editor opens with pre-written YAML |
| 4 | Edit if needed (change triggers, add inputs) |
| 5 | Click **Commit changes** → creates branch + PR |
| 6 | Merge → workflow live in Actions tab |

> Great way to learn — read GitHub's official examples for any tech stack.

---

## What Lives in "Continuous Integration"?

| Category | Examples | Use |
|---|---|---|
| **Language CI** | Node, Python, Go, Rust, Java | Build + test |
| **Container** | Docker build & push | Containerization |
| **Cloud deploy** | AWS, Azure, GCP | Release pipelines |
| **Security** | CodeQL, Dependabot | Vulnerability scanning |
| **Release** | npm publish, semantic-release | Versioning |

**Suggested learning path after today:**
Playwright CI → CodeQL security scan → Docker build → Release automation

---

# Part 8 — Hands-on Lab

---

## Lab Setup (5 min)

Before students begin, make sure they have:

- ✅ A fork of the repo (or push access)
- ✅ The 3 workflow files merged to their default branch
- ✅ Their browser tab open at `https://github.com/<their>/<repo>/actions`

```
Files used today:
  .github/workflows/playwright.yml          ← single run
  .github/workflows/playwright-sharded.yml  ← parallel run
  .github/workflows/playwright-docker.yml   ← container run
```

---

## Exercise 1 — Manual Run

**Goal:** Trigger your first GitHub Actions run.

| Step | Action |
|---|---|
| 1 | Actions tab → "Playwright Tests (Manual)" |
| 2 | Click "Run workflow ▾" (top-right) |
| 3 | Leave all inputs empty → Click green "Run workflow" |
| 4 | Watch the run appear (refresh if needed) |
| 5 | Click into the run → expand each step |
| 6 | When green, scroll to bottom → download `playwright-report` |
| 7 | Unzip locally → `npx playwright show-report <folder>` |

✅ **Success criteria:** You opened the HTML report in your browser.

---

## Exercise 2 — Filtered Run

**Goal:** Use the `grep` input to run a subset.

| Step | Action |
|---|---|
| 1 | Open any test file → add `@smoke` to a test title:<br>`test('login works @smoke', async ({ page }) => { ... })` |
| 2 | Commit & push |
| 3 | Actions tab → "Run workflow" |
| 4 | In `grep` field, type: `@smoke` |
| 5 | Run |
| 6 | Verify in logs: only matched tests ran |

✅ **Success criteria:** Test count is lower than full run.

---

## Exercise 3 — Sharded Run

**Goal:** See parallel execution.

| Step | Action |
|---|---|
| 1 | Actions tab → "Playwright Tests (Sharded, Manual)" |
| 2 | Run workflow with default inputs |
| 3 | Observe: 4 parallel jobs appear under `playwright-tests` |
| 4 | Wait for `merge-reports` to complete |
| 5 | Download `html-report--attempt-1` artifact |
| 6 | Compare total wall-clock time vs Exercise 1 |

✅ **Success criteria:** Sharded run is faster than single run.

---

## Exercise 4 — Container Run

**Goal:** Feel the speed-up from pre-built images.

| Step | Action |
|---|---|
| 1 | Actions tab → "Playwright Tests (Docker Container)" |
| 2 | Run workflow |
| 3 | Note: no "Install Playwright Browsers" step |
| 4 | Compare total time vs Exercise 1 |

✅ **Success criteria:** Total run time visibly shorter (~1-2 min less).

---

## Exercise 5 — Break It & Fix It (Bonus)

**Goal:** Practice debugging.

| Step | Action |
|---|---|
| 1 | Edit a test → add `expect(1).toBe(2)` |
| 2 | Push → run workflow |
| 3 | Watch it fail 🔴 |
| 4 | Click into the failed step → find the error |
| 5 | Download artifact → open HTML report → view trace |
| 6 | Fix the test → re-run |

✅ **Success criteria:** You navigated logs + report to find the failure.

---

## Common Pitfalls Checklist

| ⚠️ Pitfall | ✅ Fix |
|---|---|
| Forgot `--with-deps` | Add it to `npx playwright install` |
| Container version mismatch | Pin `mcr.microsoft.com/playwright:v1.57.0-noble` to match `package.json` |
| Used `npm install` in CI | Switch to `npm ci` for reproducibility |
| Cron in local time | All cron is **UTC** — convert mentally |
| Artifacts missing on failure | Add `if: ${{ !cancelled() }}` |
| Sharded matrix hardcoded | Use the dynamic `setup` job pattern |
| Tests pass locally, fail on CI | Run `docker run -it mcr.microsoft.com/playwright:v1.57.0-noble` locally |

---

## Recap — What You Learned Today

```
✅ What CI/CD is and why it matters
✅ How a workflow YAML file is structured
✅ Triggers: workflow_dispatch, schedule (cron)
✅ Inputs that map to test CLI flags
✅ Sharded parallel execution with matrix strategy
✅ Docker container images for faster, reproducible runs
✅ Debugging failed runs in the Actions UI
✅ Downloading and viewing HTML reports & traces
✅ GitHub's starter template page
```

---

## Where to Go Next

| Topic | Resource |
|---|---|
| GitHub Actions docs | https://docs.github.com/actions |
| Playwright CI docs | https://playwright.dev/docs/ci |
| Cron designer | https://crontab.guru |
| Playwright Docker images | https://playwright.dev/docs/docker |
| Marketplace (re-usable actions) | https://github.com/marketplace?type=actions |
| Trace viewer | `npx playwright show-trace trace.zip` |

---

<!-- _class: lead -->

# Questions?

**Repo:** `asamaranayake/my-first-playwright-project`
**Branch:** `claude/hopeful-dirac-8ui607`
**Slides:** `docs/session-08-github-actions-lecture.md`

🎬 Now let's open the Actions tab and run our first workflow together!
