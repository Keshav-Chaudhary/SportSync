import { test } from '@playwright/test';
import * as path from 'path';

const artifactsDir = path.join(__dirname, '../public/showcase');

async function capture(page: any, name: string, isMobile: boolean) {
  await page.waitForTimeout(1000); // Wait for animations to finish
  const fileName = `${name}_${isMobile ? 'mobile' : 'desktop'}.png`;
  const filePath = path.join(artifactsDir, fileName);
  await page.screenshot({ path: filePath });
}

test.describe('Capture Complete UI Showcase', () => {
  // ─── DESKTOP CAPTURES ───────────────────────────────────────────────────
  test('Capture Landing Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await capture(page, 'landing', false);
  });

  test('Capture Login Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/auth/login');
    await capture(page, 'login', false);
  });

  test('Capture Admin Pages Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/auth/login');
    await page.fill('#email', 'admin1@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Admin Dashboard
    await capture(page, 'admin_dashboard', false);

    // Admin Users
    await page.goto('/admin/users');
    await capture(page, 'admin_users', false);

    // Admin Equipment
    await page.goto('/admin/equipment');
    await capture(page, 'admin_equipment', false);

    // Admin Analytics
    await page.goto('/admin/analytics');
    await capture(page, 'admin_analytics', false);

    // Admin System Status
    await page.goto('/admin/system');
    await capture(page, 'admin_system', false);

    // Admin Developer Tools (SQL Playground)
    await page.goto('/admin/sql');
    await page.click('button[role="switch"]');
    await capture(page, 'admin_sql', false);
  });

  test('Capture Staff Pages Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/auth/login');
    await page.fill('#email', 'staff5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff');
    
    // Staff Dashboard
    await capture(page, 'staff_dashboard', false);

    // Staff Equipment Management
    await page.goto('/staff/equipment');
    await capture(page, 'staff_equipment', false);

    // Staff Loan Management
    await page.goto('/staff/loans');
    await capture(page, 'staff_loans', false);

    // Staff Gym Control
    await page.goto('/staff/gym');
    await capture(page, 'staff_gym', false);
  });

  test('Capture Student Pages Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/auth/login');
    await page.fill('#email', 'student5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/student');
    
    // Student Dashboard
    await capture(page, 'student_dashboard', false);

    // Student Sports Equipment Browser
    await page.goto('/student/equipment');
    await capture(page, 'student_equipment', false);

    // Student Gym Access Control
    await page.goto('/student/gym');
    await capture(page, 'student_gym', false);

    // Student My Loans & History
    await page.goto('/student/loans');
    await capture(page, 'student_loans', false);
  });

  // ─── MOBILE CAPTURES ────────────────────────────────────────────────────
  test('Capture Landing Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await capture(page, 'landing', true);
  });

  test('Capture Admin Pages Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/auth/login');
    await page.fill('#email', 'admin1@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Admin Dashboard
    await capture(page, 'admin_dashboard', true);

    // Admin Users
    await page.goto('/admin/users');
    await capture(page, 'admin_users', true);

    // Admin Equipment
    await page.goto('/admin/equipment');
    await capture(page, 'admin_equipment', true);

    // Admin System Status
    await page.goto('/admin/system');
    await capture(page, 'admin_system', true);
  });

  test('Capture Staff Pages Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/auth/login');
    await page.fill('#email', 'staff5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff');
    
    // Staff Dashboard
    await capture(page, 'staff_dashboard', true);

    // Staff Equipment Management
    await page.goto('/staff/equipment');
    await capture(page, 'staff_equipment', true);

    // Staff Gym Control
    await page.goto('/staff/gym');
    await capture(page, 'staff_gym', true);
  });

  test('Capture Student Pages Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/auth/login');
    await page.fill('#email', 'student5@gmail.com');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/student');
    
    // Student Dashboard
    await capture(page, 'student_dashboard', true);

    // Student Sports Equipment
    await page.goto('/student/equipment');
    await capture(page, 'student_equipment', true);

    // Student Gym Access Control
    await page.goto('/student/gym');
    await capture(page, 'student_gym', true);
  });
});
