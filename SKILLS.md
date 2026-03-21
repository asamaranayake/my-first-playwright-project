# SKILLS.md - Playwright Test Automation Framework

> **Comprehensive Test Automation Framework with AI Agent Integration**  
> Version 1.0.0 - Playwright ^1.58.2

---

## 🎯 **Framework Overview**

This is an advanced Playwright test automation framework designed for **enterprise-scale web application testing** with **AI agent integration**. It combines traditional testing approaches with modern agentic automation for planning, generation, and healing of test suites.

### **Core Capabilities**
- ✅ **End-to-End (E2E) Testing** - Full user journey automation
- ✅ **API Testing** - REST API validation and integration
- ✅ **Multi-Role Authentication** - Role-based access testing  
- ✅ **Network Mocking** - HAR replay, API mocking, response modification
- ✅ **Agentic Testing** - AI-powered test planning, generation & healing
- ✅ **Cross-Browser Support** - Chromium, Firefox, WebKit, Mobile viewports
- ✅ **CI/CD Integration** - GitHub Actions, Jenkins, Azure DevOps
- ✅ **Interactive CLI** - Playwright CLI with skills integration

---

## 🤖 **AI Agent Integration**

### **Test Agents**
| Agent | Purpose | Tools | Usage |
|-------|---------|--------|--------|
| **Planner** | Create comprehensive test plans | Browser automation, exploration | `@playwright-test-planner` |
| **Generator** | Generate robust test code from plans | Code generation, validation | `@playwright-test-generator` |  
| **Healer** | Debug and fix failing tests | Error analysis, debugging, fixes | `@playwright-test-healer` |

### **Agent Commands**
```bash
# Initialize agents (done automatically)
npm run init:agents

# Manual agent usage with VS Code GitHub Copilot
# Type "@playwright-test-planner" to invoke planner
# Type "@playwright-test-generator" to invoke generator  
# Type "@playwright-test-healer" to invoke healer
```

---

## 🗂️ **Framework Architecture**

### **Directory Structure**
```
├── tests/                          # Test specs organized by feature
│   ├── e2e/                       # End-to-end browser tests
│   │   ├── auth/                  # Authentication tests & setup
│   │   ├── api/                   # API integration tests
│   │   ├── mocking/               # Network mocking tests
│   │   ├── products/              # Product feature tests
│   │   └── sessionXX/             # Training session examples
│   └── todo-management.spec.ts    # Generated TodoMVC tests
├── src/                           # Page objects and utilities
│   ├── pages/                     # Page Object Model classes
│   └── api/                       # API client classes
├── fixtures/                      # Custom test fixtures
├── reporters/                     # Custom test reporters
├── specs/                         # Test plan documentation
├── .github/agents/               # AI agent configurations
└── .claude/skills/               # Playwright CLI skills
```

### **Configuration Files**
- `playwright.config.ts` - Main Playwright configuration
- `package.json` - NPM scripts and dependencies  
- `.github/workflows/` - CI/CD pipeline definitions
- `fixtures/` - Custom test fixtures for auth, API, POM

---

## 🧪 **Testing Patterns & Best Practices**

### **Page Object Model (POM)**
```typescript
// src/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(username: string, password: string) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);  
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
  
  async assertLoginSuccess() {
    await expect(this.page).to.havePath('/inventory');
  }
}
```

### **Custom Fixtures**
```typescript
// fixtures/auth-fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});
```

### **Robust Selectors**
```typescript
// ✅ Good - Semantic, role-based selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByText('Welcome back!').isVisible();
await page.getByLabel('Email address').fill('user@example.com');

// ❌ Avoid - Brittle CSS/XPath selectors  
await page.locator('#submit-btn').click();
await page.locator('xpath=//div[@class="welcome"]').isVisible();
```

### **Waiting Strategies**
```typescript
// ✅ Use built-in waiting with assertions
await expect(page.getByText('Loading...')).toBeHidden();
await expect(page.getByText('Data loaded')).toBeVisible();

// ✅ Wait for network requests  
await page.waitForResponse(resp => resp.url().includes('/api/users'));

// ❌ Never use arbitrary timeouts
// await page.waitForTimeout(5000); // DON'T DO THIS
```

---

## 🔐 **Authentication & Multi-Role Testing**

### **Authentication Setup**
```typescript
// tests/e2e/auth/admin.setup.ts
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin_user');  
  await page.getByLabel('Password').fill('admin_pass');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Save authentication state
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});
```

### **Using Authentication in Tests**
```typescript 
// playwright.config.ts - Project configuration
{
  name: 'admin-tests',
  use: { storageState: 'playwright/.auth/admin.json' },
  dependencies: ['admin-setup'],
}

// Test usage
test.describe('Admin Features', () => {
  test('admin can access dashboard', async ({ page }) => {
    // Already authenticated as admin via storageState
    await page.goto('/admin/dashboard');
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });
});
```

---

## 🌐 **API Testing**

### **API Client Pattern**
```typescript
// src/api/UsersAPI.ts
export class UsersAPI {
  constructor(private request: APIRequestContext) {}
  
  async getAllUsers() {
    const response = await this.request.get('/api/users');
    expect(response.ok()).toBe(true);
    return response.json();
  }
  
  async createUser(userData: UserData) {
    return await this.request.post('/api/users', { data: userData });
  }
  
  async deleteUser(userId: string) {
    return await this.request.delete(`/api/users/${userId}`);
  }
}
```

### **API Test Examples**  
```typescript
test.describe('Users API', () => {
  let usersApi: UsersAPI;
  
  test.beforeEach(async ({ request }) => {
    usersApi = new UsersAPI(request);
  });
  
  test('should create and delete user', async () => {
    // Create user
    const response = await usersApi.createUser({
      name: 'Test User',
      email: 'test@example.com'
    });
    expect(response.status()).toBe(201);
    
    const user = await response.json();
    expect(user.name).toBe('Test User');
    
    // Clean up
    await usersApi.deleteUser(user.id);
  });
});
```

---

## 🎭 **Network Mocking & HAR Replay**

### **HAR File Recording**
```typescript  
test('record network traffic to HAR', async ({ page }) => {
  // Start recording HAR
  await page.routeFromHAR('hars/api-calls.har', { 
    mode: 'record',
    url: '**/api/**',
    udpate: true
  });
  
  await page.goto('/dashboard');
  // All API calls are recorded to HAR file
});
```

### **HAR Replay for Deterministic Tests**
```typescript
test('replay from HAR file', async ({ page }) => {
  // Replay recorded network traffic
  await page.routeFromHR('hars/api-calls.har', {
    mode: 'replay',
    url: '**/api/**'  
  });
  
  // Test runs offline with recorded responses
  await page.goto('/dashboard'); 
  await expect(page.getByText('Total Users: 42')).toBeVisible();
});
```

### **API Response Mocking**
```typescript
test('mock API responses', async ({ page }) => {
  // Mock specific API endpoints
  await page.route('**/api/users', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Mocked User', email: 'mock@example.com' }
      ])
    });
  });
  
  await page.goto('/users');
  await expect(page.getByText('Mocked User')).toBeVisible();
});
```

---

## 📊 **Reporting & Debugging**

### **Built-in Reporters**
```bash
# HTML Report (recommended for CI)
npm test -- --reporter=html
npm run report  # View HTML report

# JSON Report for programmatic access
npm test -- --reporter=json

# JUnit XML for CI integration  
npm test -- --reporter=junit

# List Reporter for terminal output
npm test -- --reporter=list

# Multiple reporters
npm test -- --reporter=html,json,junit
```

### **Custom Reporter**  
```typescript
// reporters/summary-reporter.ts
class SummaryReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`${test.title}: ${result.status}`);
  }
  
  onEnd(result: FullResult) {
    console.log(`Tests completed: ${result.status}`);
  }
}
```

### **Debugging Techniques**
```typescript
// Visual debugging
test('debug visually', async ({ page }) => {
  await page.pause(); // Pauses execution for manual inspection
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
});

// Console/network debugging  
test('debug network', async ({ page }) => {
  // Listen to console logs
  page.on('console', msg => console.log(`Console: ${msg.text()}`));
  
  // Listen to network requests
  page.on('request', req => console.log(`Request: ${req.url()}`));
  page.on('response', resp => console.log(`Response: ${resp.status()} ${resp.url()}`));
});
```

---

## 🏗️ **CI/CD Integration**

### **GitHub Actions**
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps  
    - run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

### **Docker Integration**
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.58.2-noble
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .  
CMD ["npx", "playwright", "test"]
```

### **Parallel Execution & Sharding**
```bash
# Parallel workers (automatically detected)
npm test

# Manual worker control
npm test -- --workers=2  

# Test sharding for CI
npm test -- --shard=1/3  # Run 1st shard of 3 total shards
npm test -- --shard=2/3  # Run 2nd shard of 3 total shards  
npm test -- --shard=3/3  # Run 3rd shard of 3 total shards
```

---

## 💻 **CLI Integration & Skills**

### **Playwright CLI with Skills**
```bash  
# Install CLI with skills
npm run cli:install

# Launch interactive browser
npm run cli:open
# OR: npx @playwright/cli@latest open

# Available CLI commands:
playwright-cli open https://example.com    # Open URL
playwright-cli click e3                    # Click element ref e3
playwright-cli type "hello world"          # Type text  
playwright-cli snapshot                    # Capture page state
playwright-cli screenshot --filename=page.png  # Take screenshot
playwright-cli close                       # Close browser
```

### **Interactive Testing Flow**
1. **Plan** - Use `@playwright-test-planner` to explore app and create test plans
2. **Generate** - Use `@playwright-test-generator` to convert plans to code
3. **Debug** - Use `@playwright-test-healer` to fix failing tests
4. **Iterate** - Refine and expand test coverage

---

## ⚡ **Performance & Optimization**

### **Test Organization**
```typescript
// ✅ Group related tests
test.describe('User Authentication', () => {
  // All auth-related tests here
});

// ✅ Use describe.serial for dependent tests 
test.describe.serial('Shopping Flow', () => {
  // Tests run sequentially when order matters
});

// ✅ Use test.skip for conditional testing
test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');
```

### **Resource Management**
```typescript
// ✅ Clean up after tests
test.afterEach(async ({ page }) => {
  // Clear localStorage/sessionStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

// ✅ Reuse browser contexts
test.describe.configure({ mode: 'parallel' }); // Default
test.describe.configure({ mode: 'serial' });   // When needed
```

---

## 🛠️ **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Flaky Tests**
```typescript
// ❌ Flaky - race conditions
await page.click('button');
await page.waitForTimeout(1000); // Don't do this

// ✅ Stable - proper waiting
await page.click('button');
await expect(page.getByText('Success')).toBeVisible(); // Better
```

#### **Element Not Found**  
```typescript
// ❌ Brittle selector
await page.locator('#dynamic-id-123').click();

// ✅ Resilient selector  
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByText('Click here', { exact: true }).click();
```

#### **Timeouts**
```typescript
// Configure timeouts in playwright.config.ts
use: {
  actionTimeout: 10000,      // 10s for actions
  navigationTimeout: 30000,  // 30s for page loads  
},

// Or per test
test.setTimeout(60000); // 60s timeout for specific test
```

### **Debugging Commands**
```bash
# Debug specific test
npm test -- --debug tests/login.spec.ts

# Run in headed mode  
npm run test:headed

# Generate trace for failed tests
npm test -- --trace=on-first-retry

# Open trace viewer
npx playwright show-trace trace.zip
```

---

## 📚 **Available NPM Scripts**

### **Core Testing**
```bash
npm test                    # Run all tests
npm run test:headed        # Run with visible browser
npm run test:ui            # Launch Playwright UI mode  
npm run test:debug         # Debug mode with DevTools
```

### **Specific Test Categories**
```bash 
npm run test:api           # API tests only
npm run test:mock          # Network mocking tests
npm run test:har           # HAR replay tests
npm run test:admin         # Admin role tests  
npm run test:user          # User role tests
npm run test:setup         # Authentication setup
```

### **Reports & Utilities**
```bash
npm run report             # View HTML test report
npm run test:report        # Run tests + auto-open report
npm run clean:auth         # Clean authentication storage
```

### **Agent & CLI**
```bash
npm run init:agents        # Initialize AI test agents
npm run cli:open          # Launch Playwright CLI
npm run cli:help          # Show CLI help
```

---

## 🎓 **Training Modules Included**

This framework includes examples from **10 training sessions**:

1. **Session 01-02** - Fundamentals, Selectors, Assertions
2. **Session 03** - Forms, Frames, Dialogs, File Operations  
3. **Session 04-05** - Authentication, Multi-role testing
4. **Session 06** - Network Mocking, HAR Replay
5. **Session 07** - Page Object Model, Fixtures
6. **Session 08** - CI/CD Integration, Reporting
7. **Session 09** - Performance Testing, Advanced Patterns
8. **Session 10** - Agentic Automation (Current)

### **Learning Paths**
- **Beginner**: Start with `tests/e2e/sessionOne/` examples
- **Intermediate**: Explore authentication and mocking patterns
- **Advanced**: Study agent integration and CI/CD setups  
- **Expert**: Contribute to agent skills and custom fixtures

---

## 🤝 **Contributing & Extension**  

### **Adding New Skills**
```bash
# Add new skills to Playwright CLI
echo "New skill documentation" > .claude/skills/my-skill/SKILL.md
```

### **Creating Custom Fixtures**
```typescript
// fixtures/my-fixtures.ts
export const test = base.extend<{ myFixture: MyFixture }>({...});
```

### **Adding Agent Capabilities**  
```markdown
<!-- .github/agents/my-agent.agent.md -->
---
name: my-agent
description: Custom agent for specific testing needs
tools: [search, edit, custom-tool]
---
```

---

## 📞 **Support & Documentation**

- **Framework Author**: Dhanushka Akila Samaranayake
- **Playwright Docs**: https://playwright.dev
- **GitHub Issues**: Use project repository for bug reports
- **Training Materials**: Session examples in `tests/e2e/sessionXX/`

---

**🏆 This framework represents enterprise-grade test automation with cutting-edge AI integration for the future of software quality assurance.**