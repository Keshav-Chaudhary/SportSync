import { test, expect } from '@playwright/test';

test.describe('Staff Dashboard Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'staff5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/staff');
  });

  test('Verify staff dashboard metrics', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Staff Dashboard' })).toBeVisible();
    await expect(page.getByText('Inventory', { exact: true })).toBeVisible();
    await expect(page.locator('text=Active Loans')).toBeVisible();
    await expect(page.locator('text=Overdue')).toBeVisible();
    await expect(page.locator('text=Gym Live')).toBeVisible();
  });

  test('Verify Staff Equipment Management Page', async ({ page }) => {
    await page.goto('/staff/equipment');
    await expect(page.locator('h2', { hasText: 'Equipment Management' })).toBeVisible();
    await expect(page.locator('text=Issue Equipment').first()).toBeVisible();
    await expect(page.locator('text=Student Roll Number')).toBeVisible();
  });

  test('Verify Staff Loan Management Page', async ({ page }) => {
    await page.goto('/staff/loans');
    await expect(page.locator('h2', { hasText: 'Loan Management' })).toBeVisible();
    await expect(page.locator('text=Active & Overdue')).toBeVisible();
    await expect(page.locator('text=Loan History')).toBeVisible();
  });

  test('Verify Staff Gym Operations Page', async ({ page }) => {
    await page.goto('/staff/gym');
    await expect(page.locator('h2', { hasText: 'Gym Control' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Live Entries' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Activity Log' })).toBeVisible();
  });
});
