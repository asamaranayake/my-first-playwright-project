# Session 06: Network Mocking - Complete Sample Project

> **Session:** 06 - Network Mocking with Playwright  
> **Trainer:** Dhanushka Akila Samaranayake  
> **Demo Site:** https://demo.playwright.dev/api-mocking  

---

## 📁 Project Structure

```
session-06-complete/
├── tests/
│   └── e2e/
│       └── mocking/
│           ├── mock-api-responses.spec.ts   # route.fulfill() demos
│           ├── block-resources.spec.ts      # route.abort() demos
│           ├── modify-responses.spec.ts     # route.fetch() + route.fulfill() / route.continue()
│           ├── har-replay.spec.ts           # HAR recording & replay
│           └── network-events.spec.ts       # Network event listeners & waitForResponse
├── fixtures/
│   └── mock-fixtures.ts                     # Custom MockHelper fixture
├── test-data/
│   └── mock-responses/
│       └── fruits.json                      # Sample mock JSON data
├── hars/                                    # Directory for HAR recordings
│   └── .gitkeep
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run ALL tests
npx playwright test
```

---

## 🧪 Run Specific Test Suites

```bash
# Mock API responses (route.fulfill)
npm run test:mock

# Block resources (route.abort)
npm run test:block

# Modify real responses (route.fetch + route.fulfill / route.continue)
npm run test:modify

# HAR recording & replay
npm run test:har

# Network events & monitoring
npm run test:events

# View HTML report after tests
npm run test:report
```

---

## 📋 Test Files Overview

| File | Technique | Key APIs |
|------|-----------|----------|
| `mock-api-responses.spec.ts` | Replace responses with mock data | `page.route()`, `route.fulfill()` |
| `block-resources.spec.ts` | Block images, CSS, analytics | `route.abort()`, `resourceType()` |
| `modify-responses.spec.ts` | Intercept & modify real responses | `route.fetch()`, `route.continue()` |
| `har-replay.spec.ts` | Record & replay network traffic | `page.routeFromHAR()` |
| `network-events.spec.ts` | Monitor network activity | `page.on('request')`, `waitForResponse()` |

---

## 🔑 Key Concepts Demonstrated

1. **`route.fulfill()`** – Return completely fake responses (JSON, text, status codes, headers)
2. **`route.abort()`** – Block unwanted resources (images, fonts, analytics)
3. **`route.continue()`** – Modify outgoing requests (add/remove headers, change URL)
4. **`route.fetch()` + `route.fulfill()`** – Intercept real responses, modify them, return the modified version
5. **HAR Recording** – Save all network traffic to a JSON file for later replay
6. **Network Events** – Monitor requests, responses, and failures using event listeners
7. **`waitForResponse()`** – Synchronise with specific API calls

---

## 💡 Tips

- Always set up `page.route()` **before** `page.goto()` or the action that triggers the request
- A route handler **must** call `fulfill()`, `abort()`, or `continue()` — otherwise the request hangs
- Use `page.route()` for single-page interception, `context.route()` for all pages
- HAR files are written when the browser context closes
- Use `test.skip` for HAR recording tests once you have a saved recording

---

**Created by:** Dhanushka Akila Samaranayake  
**Last Updated:** February 2026
