/**
 * Session 08: Custom Reporter Example
 *
 * This reporter demonstrates how to build a custom Playwright reporter
 * that logs test execution to a summary file.
 *
 * Usage in playwright.config.ts:
 *   reporter: [['./reporters/summary-reporter.ts']],
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class SummaryReporter implements Reporter {
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private flakyTests = 0;
  private skippedTests = 0;
  private startTime = 0;
  private results: Array<{
    title: string;
    status: string;
    duration: number;
    retries: number;
  }> = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.totalTests = suite.allTests().length;
    this.startTime = Date.now();
    console.log(`\n🎭 Starting test run with ${this.totalTests} tests`);
    console.log(`   Workers: ${config.workers}`);
    console.log(`   Projects: ${config.projects.map(p => p.name).join(', ')}`);
    console.log('');
  }

  onTestBegin(test: TestCase) {
    console.log(`  ▶ ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    const retries = result.retry;
    const status = result.status;

    this.results.push({
      title: test.title,
      status,
      duration,
      retries,
    });

    switch (status) {
      case 'passed':
        if (retries > 0) {
          this.flakyTests++;
          console.log(`  ± ${test.title} (flaky, passed on retry ${retries}) [${duration}ms]`);
        } else {
          this.passedTests++;
          console.log(`  ✅ ${test.title} [${duration}ms]`);
        }
        break;
      case 'failed':
        this.failedTests++;
        console.log(`  ❌ ${test.title} [${duration}ms]`);
        break;
      case 'skipped':
        this.skippedTests++;
        console.log(`  ⏭️  ${test.title} (skipped)`);
        break;
      case 'timedOut':
        this.failedTests++;
        console.log(`  ⏰ ${test.title} (timed out) [${duration}ms]`);
        break;
    }
  }

  async onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;
    const minutes = Math.floor(totalDuration / 60000);
    const seconds = ((totalDuration % 60000) / 1000).toFixed(1);

    const summary = [
      '',
      '═══════════════════════════════════════════════════',
      '              📊 TEST EXECUTION SUMMARY',
      '═══════════════════════════════════════════════════',
      '',
      `  Status:    ${result.status.toUpperCase()}`,
      `  Duration:  ${minutes}m ${seconds}s`,
      '',
      `  Total:     ${this.totalTests}`,
      `  ✅ Passed:  ${this.passedTests}`,
      `  ❌ Failed:  ${this.failedTests}`,
      `  ± Flaky:   ${this.flakyTests}`,
      `  ⏭️  Skipped: ${this.skippedTests}`,
      '',
      '═══════════════════════════════════════════════════',
      '',
    ];

    // Print to console
    console.log(summary.join('\n'));

    // Write summary to file
    const outputDir = 'test-results';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const summaryJson = {
      status: result.status,
      duration: totalDuration,
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      flaky: this.flakyTests,
      skipped: this.skippedTests,
      results: this.results,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(outputDir, 'summary.json'),
      JSON.stringify(summaryJson, null, 2)
    );

    console.log(`📄 Summary written to ${path.join(outputDir, 'summary.json')}`);
  }
}

export default SummaryReporter;
