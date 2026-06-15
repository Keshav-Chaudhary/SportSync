import { test, expect } from '@playwright/test';

test.describe('API Access Control and Data Verification', () => {
  test('Admin role can retrieve system stats successfully', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'admin1@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');

    // Issue API request within the authenticated session
    const response = await page.request.get('/api/stats');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('totalUsers');
    expect(body).toHaveProperty('activeLoans');
    expect(body).toHaveProperty('totalEquipment');
  });

  test('Student role is forbidden from retrieving system stats', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'student5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/student');

    const response = await page.request.get('/api/stats');
    // Stats API enforces ADMIN-only access, returning 403 Forbidden
    expect(response.status()).toBe(403);
  });

  test('Admin role can access export data endpoint', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'admin1@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');

    const response = await page.request.get('/api/admin/export/data');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('summary');
    expect(body).toHaveProperty('userAccounts');
    expect(body).toHaveProperty('equipment');
  });
});
