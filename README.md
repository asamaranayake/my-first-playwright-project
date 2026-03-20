# Session 10: Agentic Automation — Sample Project

> Part of the **Playwright Training Programme** by Dhanushka Akila Samaranayake

## Overview

This project demonstrates **Playwright Test Agents** and **Playwright CLI with SKILLS** for agentic test automation. Learn how AI agents can plan, generate, and heal tests with minimal human intervention.

## Prerequisites

- Node.js 18+
- VS Code v1.105+ with GitHub Copilot (for agent loop)
- Session 01–09 knowledge
- Playwright `^1.49`

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run the seed test
npm run test:seed

# Run all tests
npm test

# Run with headed browser
npm run test:headed
```

## Agent Setup

```bash
# Initialize Playwright Test Agents (already done in this project)
npm run init:agents

# This creates:
# .github/copilot/planner.md
# .github/copilot/generator.md
# .github/copilot/healer.md
```

## CLI with SKILLS

```bash
# Install SKILLS for coding agents
npm run cli:install

# Open a browser via CLI
npm run cli:open

# Get CLI help
npm run cli:help

# Run the CLI demo script
bash scripts/cli-demo.sh
```

## Project Structure

```
session-10-complete/
├── .github/
│   └── copilot/
│       ├── planner.md                # 🎭 Planner agent definition
│       ├── generator.md              # 🎭 Generator agent definition
│       └── healer.md                 # 🎭 Healer agent definition
├── scripts/
│   └── cli-demo.sh                   # CLI with SKILLS demo commands
├── specs/
│   └── todo-management.md            # Test plan (Planner output)
├── tests/
│   ├── seed.spec.ts                  # Seed test — agent starting point
│   ├── todo-management.spec.ts       # Generated tests (Generator output)
│   └── healer-demo.spec.ts           # Self-healing pattern demo
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies and scripts
├── playwright.config.ts              # Playwright configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

## Agentic Workflow

```
1. Write seed test        → tests/seed.spec.ts
2. Run 🎭 Planner          → specs/todo-management.md generated
3. Run 🎭 Generator        → tests/todo-management.spec.ts generated
4. Run tests              → some may fail
5. Run 🎭 Healer           → failing tests auto-fixed
6. Review & commit        → human reviews agent patches
```

## Three Agents Explained

| Agent | Purpose | Input | Output |
|-------|---------|-------|--------|
| 🎭 **Planner** | Explores app, creates test plans | Seed test + live app | `specs/*.md` |
| 🎭 **Generator** | Converts plans to executable tests | `specs/*.md` | `tests/*.spec.ts` |
| 🎭 **Healer** | Auto-fixes failing tests | Failed tests + live app | Patched `tests/*.spec.ts` |

## CLI Commands Reference

| Command | Description |
|---------|-------------|
| `open` | Open a browser session |
| `goto <url>` | Navigate to URL |
| `click <selector>` | Click an element |
| `fill <selector> <value>` | Fill a form field |
| `snapshot` | Accessibility tree snapshot |
| `screenshot` | Take a screenshot |
| `list` | List active sessions |
| `close-all` | Close all sessions |
| `show` | Open monitoring dashboard |

## Exercises

1. **Exercise 1**: Initialize agents and customize the seed test for TodoMVC
2. **Exercise 2**: Practice CLI commands to interact with a browser 
3. **Exercise 3**: Write a test plan (spec) in Markdown format

## Related Sessions

- [Session 09: AI-Augmented Automation + MCP](../session-09-complete/)
- [Session 08: CI/CD Integration](../session-08-complete/)
