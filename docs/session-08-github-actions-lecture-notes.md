# Session 08 — Playwright + GitHub Actions
## Lecture Notes (Beginner Friendly)

**Repo:** `asamaranayake/my-first-playwright-project`
**Audience:** Beginners — never touched CI/CD before
**Goal:** Run Playwright tests on GitHub Actions, manually and on a schedule

---

## Agenda

| # | Topic |
|---|---|
| 1 | Why CI/CD? |
| 2 | Anatomy of a GitHub Actions YAML file |
| 3 | Workflow 1 — Manual single run |
| 4 | Workflow 2 — Sharded parallel run |
| 5 | Workflow 3 — Docker container speed-up |
| 5b | Workflow 4 — Publish report to GitHub Pages |
| 6 | Debugging failed runs & artifacts |
| 7 | GitHub's starter templates |
| 8 | Hands-on lab |

---

## 1. Why CI/CD?

**The problem:**

```
Without CI                          With CI
─────────                          ─────────
"Works on my machine"   ──────►    "Works on a fresh Linux VM"
Manual test runs                   Auto-runs on schedule/button
Forgot to run tests                 Can't forget — robot runs them
Slow regression testing             4 parallel shards = 4x faster
No history                          Every run logged forever
```

> CI = robots running your tests on someone else's computer, automatically.

**What is GitHub Actions?**

1. You write a YAML file in `.github/workflows/*.yml`
2. You push it to GitHub
3. GitHub detects it and shows it in the **Actions** tab
4. A trigger fires (manual click, push, schedule, etc.)
5. GitHub spins up a fresh Ubuntu VM
6. It runs your steps in order
7. Results (logs, artifacts) are saved, then the VM is destroyed

Free tier: 2,000 minutes/month for private repos, unlimited for public repos.

---

## 2. Anatomy of a Workflow File

```yaml
name: Playwright Tests              # 1. Display name in UI

on:                                  # 2. WHEN to run
  workflow_dispatch:                 #    (manual button)

jobs:                                # 3. WHAT machines to spin up
  test:
    runs-on: ubuntu-latest           # 4. WHICH OS
    steps:                           # 5. WHAT commands to run
      - uses: actions/checkout@v5    #    (uses = pre-made action)
      - run: npm test                #    (run = shell command)
```

| Block | Purpose | Example |
|---|---|---|
| `name` | Label shown in Actions UI | `Playwright Tests` |
| `on` | Trigger | `push`, `schedule`, `workflow_dispatch` |
| `jobs` | One or more machines | `test:`, `build:`, `deploy:` |
| `runs-on` | OS | `ubuntu-latest`, `windows-latest` |
| `steps` | Sequential commands | `checkout`, `npm install`, `test` |

**Triggers (`on:`) — the most important concept:**

| Trigger | When it fires | Use case |
|---|---|---|
| `push` | Every git push | Verify every commit |
| `pull_request` | PR opened/updated | Gate merges |
| `workflow_dispatch` | Manual button click | On-demand runs |
| `schedule` (cron) | Recurring timer | Nightly regression |

In this lesson we only use `workflow_dispatch` + `schedule` — no push/PR triggers — so students click the button themselves and watch.

**Cron syntax in 60 seconds:**

```
┌───────── minute (0–59)
│ ┌─────── hour (0–23, UTC)
│ │ ┌───── day-of-month (1–31)
│ │ │ ┌─── month (1–12)
│ │ │ │ ┌─ day-of-week (0–6, Sun=0)
│ │ │ │ │
0 2 * * *    → every day at 02:00 UTC
0 3 * * 1    → every Monday at 03:00 UTC
```

Use [crontab.guru](https://crontab.guru) to design and validate.

> **Note for this repo:** all `schedule:` blocks are **commented out** in the workflow files so the demos don't trigger unwanted automatic runs. Uncomment them when you actually want scheduled execution.

---

## 3. Workflow 1 — Manual Single Run

File: `.github/workflows/playwright.yml`

**What it does:**

- Trigger: click "Run workflow" OR runs daily at 02:00 UTC
- Steps: checkout → setup Node → npm install → install browsers → run tests → upload report

**Inputs (the form you fill in before running):**

| Field | What it does | Example |
|---|---|---|
| `grep` | Filter tests by name/tag | `@smoke` |
| `project` | Pick a Playwright project | `chromium` |
| `headed` | Run in headed mode | checkbox |

These map to:
```bash
npx playwright test --grep "@smoke" --project=chromium
```

**The YAML, explained line by line:**

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
- `workflow_dispatch:` adds the manual "Run workflow" button
- `inputs:` are the form fields shown before the run
- `schedule:` also runs it automatically every night

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
Every step starts from a clean Ubuntu VM — that's why everything is re-installed each run.

**Why `--with-deps`?**

```
npx playwright install              → downloads browser binaries only
npx playwright install --with-deps  → also installs OS libraries
                                       (fonts, codecs, GTK, etc.)
```
Without `--with-deps` you'll see errors like `libnss3.so: cannot open shared object`. Always use it on CI.

---

## 4. Workflow 2 — Sharded Parallel Run

File: `.github/workflows/playwright-sharded.yml`

**The sharding idea:**

```
100 tests, one machine takes 20 minutes.

One big runner:                    4 parallel runners (sharded):
┌──────────────────┐               ┌─────┬─────┬─────┬─────┐
│ All 100 tests    │               │ 25  │ 25  │ 25  │ 25  │
│ 20 min           │               │tests│tests│tests│tests│
└──────────────────┘               │5 min│5 min│5 min│5 min│
                                   └─────┴─────┴─────┴─────┘
                                   Total: ~5 minutes
```

Playwright's built-in flag does the split:
```bash
npx playwright test --shard=2/4   # "I am runner #2 of 4"
```

**Three-stage pipeline:**

1. **`setup` job** — builds the shard list (e.g. `[1,2,3,4]`) from your input
2. **`playwright-tests` job (matrix)** — runs N parallel jobs, each handling its own shard, each uploads a "blob" report artifact
3. **`merge-reports` job** — downloads all blob artifacts and merges them into one HTML report

**Matrix strategy — one job definition, many runners:**

```yaml
strategy:
  fail-fast: false              # don't cancel siblings if one fails
  matrix:
    shardIndex: [1, 2, 3, 4]    # spawns 4 parallel jobs
```
The same `steps:` block runs 4 times in parallel, with `${{ matrix.shardIndex }}` taking values 1, 2, 3, 4.

**Why a setup job first?**

| Without setup job | With setup job |
|---|---|
| `matrix: [1,2,3,4]` hardcoded | `matrix: fromJson(...)` dynamic |
| Input `shardTotal=6` still only runs 4 shards | Input `shardTotal=6` correctly runs 6 shards |

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

**Blob reports → merged HTML:**

```
Shard 1 → blob-report-1/
Shard 2 → blob-report-2/      all downloaded into one folder
Shard 3 → blob-report-3/   →  npx playwright merge-reports --reporter html
Shard 4 → blob-report-4/      → playwright-report/ (the report you open)
```

---

## 5. Workflow 3 — Docker Container

File: `.github/workflows/playwright-docker.yml`

**The problem:** every run wastes ~90 seconds installing browsers.

```
Setup Node       15s
npm install      30s
Install browsers 90s   ← repeated every run, x4 if sharded
Run tests        45s
```

**The fix:** run inside a pre-built image that already has Node + all browsers + OS deps baked in.

```
mcr.microsoft.com/playwright:v1.57.0-noble
                              └────┬────┘ └─┬─┘
                       Playwright version   Ubuntu base
```

Version pinning is critical — must match `@playwright/test` in `package.json`.

**Side-by-side comparison:**

| Step | `playwright.yml` (bare Ubuntu) | `playwright-docker.yml` (container) |
|---|---|---|
| Checkout repo | yes | yes |
| Setup Node | yes (~15s) | no (already in image) |
| npm install/ci | yes (~30s) | yes (~10s) |
| Install browsers | yes (~90s) | no (already in image) |
| Run tests | yes | yes |
| Upload artifact | yes | yes |
| **Total overhead** | **~2 min** | **~10-30s** |

**The magic line:**

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
The entire job runs inside the Docker image — no `setup-node`, no `playwright install`.

**`npm install` vs `npm ci`:**

| Command | Behavior | When to use |
|---|---|---|
| `npm install` | Reads `package.json`, can update lockfile | Local dev |
| `npm ci` | Strict install from `package-lock.json`, errors on mismatch | CI |

---

## 5b. Workflow 4 — Publish Report to GitHub Pages

File: `.github/workflows/playwright-pages.yml`

**Problem with artifacts alone:** every report is a zip you have to download, unzip, and open locally. There's no shareable link, and old reports are easy to lose track of.

**The fix:** run the tests, then push the HTML report to a `gh-pages` branch so GitHub serves it as a real website with a permanent URL.

```
Job 1: test           Job 2: deploy-report
┌──────────────┐      ┌────────────────────────────────┐
│ run tests    │ ───► │ download playwright-report      │
│ upload zip   │      │ push to gh-pages branch          │
│ artifact too │      │   destination_dir: reports/<run> │
└──────────────┘      └────────────────────────────────┘
                                    ↓
                  https://<owner>.github.io/<repo>/reports/<run_number>/
```

**One-time setup (do this once per repo):**

1. Run the workflow once (Actions tab → "Playwright Report (GitHub Pages)" → Run workflow) — this creates the `gh-pages` branch automatically
2. Go to **Settings → Pages**
3. Under **Source**, choose **"Deploy from a branch"**
4. Branch: `gh-pages`, folder: `/ (root)` → Save
5. Wait ~1 minute, then visit the printed URL from the workflow's last step

**Why each run gets its own folder:**

```yaml
destination_dir: reports/${{ github.run_number }}
keep_files: true
```
- `destination_dir` puts each run in `reports/12`, `reports/13`, etc. — instead of overwriting the same path every time
- `keep_files: true` tells the deploy action **not to delete** previously published folders, so report history accumulates instead of being wiped each run

**Why `deploy-report` still runs if tests fail:**

```yaml
deploy-report:
  needs: [test]
  if: ${{ !cancelled() }}
```
Same convention as the artifact upload step in the other workflows: you usually *want* to see the report for a failing run (that's the whole point of debugging), so it only skips when the run is **cancelled**, not when tests fail.

**Demo for students:**

1. Run the workflow → wait for both jobs to go green
2. Open `https://<owner>.github.io/<repo>/reports/<run_number>/`
3. Run it again → note the run number increments and the old report is still reachable at its own URL

---

## 6. Debugging & Artifacts

**Actions tab layout:**

```
GitHub repo → Actions tab

All workflows (left sidebar):
  Playwright Tests (Manual)
  Playwright Tests (Sharded)
  Playwright Tests (Docker)
  Playwright Report (GitHub Pages)

Workflow runs (main panel):
  [green]  #42  Manual run on main      2 min ago
  [red]    #41  Scheduled nightly       8 hours ago
  [yellow] #40  Manual run (running)    1 min ago
```
Status colors: yellow = running, green = passed, red = failed, gray = cancelled.

**Debugging a failed run:**

1. Click the failed run (red)
2. Click the failed job in the left panel
3. Expand the failed step (red X next to its name)
4. Read the logs top to bottom

| Symptom | Where to look |
|---|---|
| Test assertion failed | "Run Playwright tests" step, scroll to first error |
| Browser missing | Did you forget `--with-deps`? Wrong image version? |
| YAML error | Top of run page: "Invalid workflow file" + line number |
| Step took forever | Each step shows duration on the right |
| Need more detail | Use "Re-run with debug logging" |

**Re-running, top-right of any failed run:**

| Button | What it does |
|---|---|
| Re-run all jobs | Fresh start, all jobs from scratch |
| Re-run failed jobs | Only retries the broken shards |
| Re-run with debug logging | Verbose logs |

**Artifacts — where reports live.** Scroll to the bottom of any completed run's summary page:

```
Artifacts
  playwright-report      45.2 MB
  blob-report-1           2.1 MB
  blob-report-2           1.8 MB
```

**Opening a report locally:**

```bash
unzip playwright-report.zip -d report
npx playwright show-report report
```
You'll see pass/fail per test, screenshots on failure, videos, and the trace viewer (step-by-step replay with DOM snapshots) — the single best tool for diagnosing CI failures.

---

## 7. GitHub's Starter Templates

URL pattern: `https://github.com/<owner>/<repo>/actions/new?category=continuous-integration`

GitHub scans your repo (sees `package.json`, detects Playwright) and suggests relevant templates at the top of that page.

**How to use it:**

1. Open the URL
2. Click "Configure" on a template card
3. Web editor opens with pre-written YAML
4. Edit if needed (triggers, inputs)
5. Click "Commit changes" → creates a branch + PR
6. Merge → workflow is live in the Actions tab

**What else lives under "Continuous Integration":**

| Category | Examples |
|---|---|
| Language CI | Node, Python, Go, Rust, Java |
| Container | Docker build & push |
| Cloud deploy | AWS, Azure, GCP |
| Security | CodeQL, Dependabot |
| Release | npm publish, semantic-release |

Suggested learning path after today: Playwright CI → CodeQL security scan → Docker build → release automation.

---

## 8. Hands-on Lab

**Setup:** make sure students have a fork (or push access), the 3 workflow files merged to their default branch, and the Actions tab open.

### Exercise 1 — Manual Run
1. Actions tab → "Playwright Tests (Manual)"
2. Click "Run workflow"
3. Leave inputs empty → click green "Run workflow"
4. Watch the run appear
5. Click in → expand each step
6. When green, scroll down → download `playwright-report`
7. Unzip locally → `npx playwright show-report <folder>`

Success: you opened the HTML report in your browser.

### Exercise 2 — Filtered Run
1. Add `@smoke` to a test title, e.g. `test('login works @smoke', ...)`
2. Commit & push
3. Run workflow, put `@smoke` in the `grep` field
4. Verify in logs that only matching tests ran

Success: test count is lower than the full run.

### Exercise 3 — Sharded Run
1. Actions tab → "Playwright Tests (Sharded, Manual)" → Run
2. Observe 4 parallel jobs under `playwright-tests`
3. Wait for `merge-reports`
4. Download the merged HTML report
5. Compare total time vs Exercise 1

Success: sharded run is faster than the single run.

### Exercise 4 — Container Run
1. Actions tab → "Playwright Tests (Docker Container)" → Run
2. Note there's no "Install Playwright Browsers" step
3. Compare total time vs Exercise 1

Success: visibly shorter run time.

### Exercise 5 — Break It & Fix It (bonus)
1. Add a failing assertion, e.g. `expect(1).toBe(2)`
2. Push, run the workflow, watch it fail
3. Click into the failed step, find the error
4. Download the artifact, open the report, view the trace
5. Fix the test, re-run

Success: you navigated logs and the report to find the failure.

---

## Common Pitfalls Checklist

| Pitfall | Fix |
|---|---|
| `npm ci` fails with "no package-lock.json" | Run `npm install` once locally, commit `package-lock.json`. `npm ci` requires the lockfile to already exist — it never generates one |
| Forgot `--with-deps` | Add it to `npx playwright install` |
| Container version mismatch | Pin image tag to match `@playwright/test` in `package.json` |
| Used `npm install` in CI | Switch to `npm ci` |
| Cron in local time | All cron is UTC |
| Artifacts missing on failure | Add `if: ${{ !cancelled() }}` |
| Sharded matrix hardcoded | Use the dynamic `setup` job pattern |
| Tests pass locally, fail on CI | Run `docker run -it mcr.microsoft.com/playwright:v1.57.0-noble` locally to reproduce |

---

## Recap

- What CI/CD is and why it matters
- How a workflow YAML file is structured
- Triggers: `workflow_dispatch`, `schedule` (cron)
- Inputs that map to test CLI flags
- Sharded parallel execution with matrix strategy
- Docker container images for faster, reproducible runs
- Debugging failed runs in the Actions UI
- Downloading and viewing HTML reports & traces
- GitHub's starter template page

## Where to Go Next

| Topic | Link |
|---|---|
| GitHub Actions docs | https://docs.github.com/actions |
| Playwright CI docs | https://playwright.dev/docs/ci |
| Cron designer | https://crontab.guru |
| Playwright Docker images | https://playwright.dev/docs/docker |
| Marketplace (reusable actions) | https://github.com/marketplace?type=actions |
| Trace viewer | `npx playwright show-trace trace.zip` |
