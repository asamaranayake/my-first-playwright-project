/**
 * Session 03: File Operations (Upload & Download)
 * 
 * This file demonstrates file upload and download handling.
 * 
 * Demo Site: https://the-internet.herokuapp.com/upload
 *            https://the-internet.herokuapp.com/download
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('File Upload', () => {
  test.describe('Standard file input', () => {
    test('upload a single file using setInputFiles', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/upload');

      // Create a test file for upload
      const testFilePath = path.join(__dirname, '../../test-data/uploads/sample.txt');
      
      // Ensure test file exists
      if (!fs.existsSync(testFilePath)) {
        const dir = path.dirname(testFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(testFilePath, 'This is a test file for upload');
      }

      // Upload the file
      await page.locator('#file-upload').setInputFiles(testFilePath);

      // Click upload button
      await page.locator('#file-submit').click();

      // Verify upload success
      await expect(page.locator('#uploaded-files')).toContainText('sample.txt');
    });

    test('upload multiple files', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/upload');

      // Create test files
      const testDir = path.join(__dirname, '../../test-data/uploads');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');
      
      fs.writeFileSync(file1, 'File 1 content');
      fs.writeFileSync(file2, 'File 2 content');

      // Note: This specific demo site may only accept single file
      // But the pattern for multiple files is:
      await page.locator('#file-upload').setInputFiles([file1, file2]);
    });

    test('upload file with buffer (no physical file)', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/upload');

      // Create file from buffer (no physical file needed)
      await page.locator('#file-upload').setInputFiles({
        name: 'buffer-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Content created in memory')
      });

      await page.locator('#file-submit').click();
      await expect(page.locator('#uploaded-files')).toContainText('buffer-file.txt');
    });

    test('clear file selection', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/upload');

      // Create and select a file
      const testFile = path.join(__dirname, '../../test-data/uploads/sample.txt');
      if (!fs.existsSync(path.dirname(testFile))) {
        fs.mkdirSync(path.dirname(testFile), { recursive: true });
      }
      fs.writeFileSync(testFile, 'Test content');

      await page.locator('#file-upload').setInputFiles(testFile);

      // Clear the selection
      await page.locator('#file-upload').setInputFiles([]);
    });
  });

  test.describe('Drag and drop upload', () => {
    test.skip('upload via drag and drop', async ({ page }) => {
      // This is a pattern example - requires a site with drag-drop upload
      await page.goto('https://example.com/dragdrop-upload');

      // Create file buffer
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
      
      // Dispatch drop event to the drop zone
      await page.locator('.drop-zone').dispatchEvent('drop', { dataTransfer });
    });
  });
});

test.describe('File Download', () => {
  test('download a file and verify', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/download');

    // Start waiting for download BEFORE clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click a download link (first .txt file)
    await page.locator('a[href$=".txt"]').first().click();
    
    // Wait for download to complete
    const download = await downloadPromise;

    // Get download info
    console.log('Downloaded file:', download.suggestedFilename());
    
    // Verify the filename
    expect(download.suggestedFilename()).toMatch(/\.txt$/);
    
    // Save to specific location
    const downloadPath = path.join(__dirname, '../../downloads', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    // Verify file exists
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    
    // Clean up (optional)
    // fs.unlinkSync(downloadPath);
  });

  test('download and read file content', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/download');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('a[href$=".txt"]').first().click();
    const download = await downloadPromise;

    // Get readable stream and read content
    const stream = await download.createReadStream();
    
    if (stream) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks).toString('utf-8');
      console.log('File content:', content);
    }
  });

  test('handle download failure', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/download');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('a[href$=".txt"]').first().click();
    const download = await downloadPromise;

    // Check for download failure
    const failure = await download.failure();
    
    if (failure) {
      console.log('Download failed:', failure);
    } else {
      console.log('Download successful');
    }
  });

  test('cancel a download', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/download');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('a').first().click();
    const download = await downloadPromise;

    // Cancel the download
    await download.cancel();
    
    // Verify download was cancelled
    const failure = await download.failure();
    // failure might be 'canceled' or similar
  });

  test('download with custom path in config', async ({ browser }) => {
    // Create browser context with downloads path
    const context = await browser.newContext({
      acceptDownloads: true,
    });
    const page = await context.newPage();

    await page.goto('https://the-internet.herokuapp.com/download');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('a[href$=".txt"]').first().click();
    const download = await downloadPromise;

    // Downloads are stored in a temporary location by default
    // Use saveAs() to move to desired location
    const customPath = path.join(__dirname, '../../downloads', 'custom-name.txt');
    await download.saveAs(customPath);

    await context.close();
  });
});
