import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('Successful login for Admin', async ({ page }) => {
    await page.fill('#email', 'admin1@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('Successful login for Staff', async ({ page }) => {
    await page.fill('#email', 'staff5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/staff');
  });

  test('Successful login for Student', async ({ page }) => {
    await page.fill('#email', 'student5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/student');
  });

  test('Unsuccessful login displays error message', async ({ page }) => {
    await page.fill('#email', 'invalid@gmail.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Error message should appear
    const errorText = page.locator('form div:has-text("Invalid")');
    await expect(errorText).toBeVisible();
  });
});
