import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard and Developer Tools', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login first
    await page.goto('/auth/login');
    await page.fill('#email', 'admin1@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('Verify admin dashboard overview and status metrics', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'System Dashboard' })).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Loans')).toBeVisible();
    await expect(page.getByText('Inventory', { exact: true })).toBeVisible();
    await expect(page.locator('text=Gym Activity')).toBeVisible();
    await expect(page.locator('text=Live Status')).toBeVisible();
  });

  test('Verify User Management Page', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('h2', { hasText: 'User Accounts' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th', { hasText: 'User ID' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Email' })).toBeVisible();
  });

  test('Verify SQL Playground and custom query execution', async ({ page }) => {
    await page.goto('/admin/sql');
    await expect(page.locator('h2', { hasText: 'Developer Tools' })).toBeVisible();

    // Toggle developer mode on
    await page.click('button[role="switch"]');

    // Verify SQL Playground exists
    await expect(page.locator('text=SQL Playground & Transaction Simulator')).toBeVisible();

    // Fill custom SELECT query
    await page.fill('textarea[placeholder*="SELECT"]', 'SELECT * FROM EQUIPMENT LIMIT 1');
    await page.click('button:has-text("Execute Custom Query")');

    // Verify result is a success
    await expect(page.locator('span:has-text("Success")').first()).toBeVisible();
  });

  test('Verify System Report Download action', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=data.export')).toBeVisible();

    // Set up download event listener
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=data.export');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('admin-complete-report');
  });
});
