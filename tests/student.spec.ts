import { test, expect } from '@playwright/test';

test.describe('Student Dashboard Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'student5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/student');
  });

  test('Verify student dashboard metrics & monthly progress targets', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Student Dashboard' })).toBeVisible();
    await expect(page.getByText('Active Loans', { exact: true }).first()).toBeVisible();
    await expect(page.locator('text=Monthly Loans')).toBeVisible();
    await expect(page.locator('text=Gym Visits')).toBeVisible();
    await expect(page.locator('text=Gym Status')).toBeVisible();
    await expect(page.locator('text=Monthly Progress Goals')).toBeVisible();
  });

  test('Verify Student Equipment Browser Page', async ({ page }) => {
    await page.goto('/student/equipment');
    await expect(page.locator('h2', { hasText: 'Sports Equipment' })).toBeVisible();
  });

  test('Verify Student Gym Check-in Portal', async ({ page }) => {
    await page.goto('/student/gym');
    await expect(page.locator('h2', { hasText: 'Gym Access Control' })).toBeVisible();
    await expect(page.locator('text=Gym Access Status')).toBeVisible();
  });

  test('Verify Student Personal Loans Page & history', async ({ page }) => {
    await page.goto('/student/loans');
    await expect(page.locator('h2', { hasText: 'My Loans & History' })).toBeVisible();
  });
});
