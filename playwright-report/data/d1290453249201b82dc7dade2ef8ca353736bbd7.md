# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Dashboard Operations >> Deletion safeguard warning appears
- Location: tests\e2e\admin.spec.ts:34:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ has: locator('svg.lucide-trash-2') }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e7]
        - generic [ref=e9]: Admin Panel
      - generic [ref=e10]:
        - generic [ref=e11]: Overview
        - link "Dashboard" [ref=e12] [cursor=pointer]:
          - /url: /admin
          - img [ref=e13]
          - generic [ref=e18]: Dashboard
        - link "System" [ref=e19] [cursor=pointer]:
          - /url: /admin/system
          - img [ref=e20]
          - generic [ref=e22]: System
        - generic [ref=e23]: Management
        - link "Users" [ref=e24] [cursor=pointer]:
          - /url: /admin/users
          - img [ref=e25]
          - generic [ref=e30]: Users
        - link "Equipment" [ref=e31] [cursor=pointer]:
          - /url: /admin/equipment
          - img [ref=e32]
          - generic [ref=e36]: Equipment
        - generic [ref=e37]: Intelligence
        - link "Analytics" [ref=e38] [cursor=pointer]:
          - /url: /admin/analytics
          - img [ref=e39]
          - generic [ref=e42]: Analytics
        - link "Dev Tools" [ref=e43] [cursor=pointer]:
          - /url: /admin/sql
          - img [ref=e44]
          - generic [ref=e48]: Dev Tools
      - link "Go to Landing Page" [ref=e50] [cursor=pointer]:
        - /url: /
        - img [ref=e51]
        - generic [ref=e53]: Go to Landing Page
    - generic [ref=e55]:
      - banner [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - img [ref=e60]
            - generic [ref=e66]:
              - heading "SportSync" [level=1] [ref=e67]
              - paragraph [ref=e68]: Administrator Portal
          - generic [ref=e69]:
            - button "Toggle theme" [ref=e70]:
              - img
              - img
              - generic [ref=e71]: Toggle theme
            - button "SA" [ref=e72]:
              - generic [ref=e74]: SA
      - main [ref=e75]:
        - generic [ref=e76]:
          - heading "User Accounts" [level=2] [ref=e77]:
            - img [ref=e79]
            - text: User Accounts
          - paragraph [ref=e84]: Manage roles, review activity, and oversee access control for all users.
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]:
              - img [ref=e89]
              - text: User Management
            - generic [ref=e94]: Manage user accounts and permissions
          - generic [ref=e95]:
            - generic [ref=e96]:
              - generic [ref=e97]:
                - img [ref=e98]
                - textbox "Search users..." [ref=e101]
              - combobox [ref=e102]:
                - generic: All Roles
                - img
            - table [ref=e105]:
              - rowgroup [ref=e106]:
                - row "Name Email Role User ID Joined Change Role Actions" [ref=e107]:
                  - columnheader "Name" [ref=e108]
                  - columnheader "Email" [ref=e109]
                  - columnheader "Role" [ref=e110]
                  - columnheader "User ID" [ref=e111]
                  - columnheader "Joined" [ref=e112]
                  - columnheader "Change Role" [ref=e113]
                  - columnheader "Actions" [ref=e114]
              - rowgroup [ref=e115]:
                - row "Entry 15april e@gmail.com STUDENT 36985 Apr 15, 2026" [ref=e116]:
                  - cell "Entry 15april" [ref=e117]
                  - cell "e@gmail.com" [ref=e118]
                  - cell "STUDENT" [ref=e119]:
                    - generic [ref=e120]: STUDENT
                  - cell "36985" [ref=e121]
                  - cell "Apr 15, 2026" [ref=e122]
                  - cell [ref=e123]:
                    - combobox [ref=e124]:
                      - generic: Student
                      - img
                  - cell [ref=e125]:
                    - generic [ref=e126]:
                      - button [ref=e127]:
                        - img
                      - button [ref=e128]:
                        - img
                - row "keshav ch k@gmail.com STUDENT 123456 Apr 15, 2026" [ref=e129]:
                  - cell "keshav ch" [ref=e130]
                  - cell "k@gmail.com" [ref=e131]
                  - cell "STUDENT" [ref=e132]:
                    - generic [ref=e133]: STUDENT
                  - cell "123456" [ref=e134]
                  - cell "Apr 15, 2026" [ref=e135]
                  - cell [ref=e136]:
                    - combobox [ref=e137]:
                      - generic: Student
                      - img
                  - cell [ref=e138]:
                    - generic [ref=e139]:
                      - button [ref=e140]:
                        - img
                      - button [ref=e141]:
                        - img
                - row "Admin 1 admin1@gmail.com ADMIN 4 Apr 8, 2026" [ref=e142]:
                  - cell "Admin 1" [ref=e143]
                  - cell "admin1@gmail.com" [ref=e144]
                  - cell "ADMIN" [ref=e145]:
                    - generic [ref=e146]: ADMIN
                  - cell "4" [ref=e147]
                  - cell "Apr 8, 2026" [ref=e148]
                  - cell [ref=e149]:
                    - combobox [ref=e150]:
                      - generic: Admin
                      - img
                  - cell [ref=e151]:
                    - generic [ref=e152]:
                      - button [ref=e153]:
                        - img
                      - button [ref=e154]:
                        - img
                - row "staff 5 staff5@gmail.com STAFF 3 Apr 8, 2026" [ref=e155]:
                  - cell "staff 5" [ref=e156]
                  - cell "staff5@gmail.com" [ref=e157]
                  - cell "STAFF" [ref=e158]:
                    - generic [ref=e159]: STAFF
                  - cell "3" [ref=e160]
                  - cell "Apr 8, 2026" [ref=e161]
                  - cell [ref=e162]:
                    - combobox [ref=e163]:
                      - generic: Staff
                      - img
                  - cell [ref=e164]:
                    - generic [ref=e165]:
                      - button [ref=e166]:
                        - img
                      - button [ref=e167]:
                        - img
                - row "student 5 student5@gmail.com STUDENT 005 Apr 8, 2026" [ref=e168]:
                  - cell "student 5" [ref=e169]
                  - cell "student5@gmail.com" [ref=e170]
                  - cell "STUDENT" [ref=e171]:
                    - generic [ref=e172]: STUDENT
                  - cell "005" [ref=e173]
                  - cell "Apr 8, 2026" [ref=e174]
                  - cell [ref=e175]:
                    - combobox [ref=e176]:
                      - generic: Student
                      - img
                  - cell [ref=e177]:
                    - generic [ref=e178]:
                      - button [ref=e179]:
                        - img
                      - button [ref=e180]:
                        - img
                - row "Mithil K m.kaul@gmail.com ADMIN 2 Feb 1, 2026" [ref=e181]:
                  - cell "Mithil K" [ref=e182]
                  - cell "m.kaul@gmail.com" [ref=e183]
                  - cell "ADMIN" [ref=e184]:
                    - generic [ref=e185]: ADMIN
                  - cell "2" [ref=e186]
                  - cell "Feb 1, 2026" [ref=e187]
                  - cell [ref=e188]:
                    - combobox [ref=e189]:
                      - generic: Admin
                      - img
                  - cell [ref=e190]:
                    - generic [ref=e191]:
                      - button [ref=e192]:
                        - img
                      - button [ref=e193]:
                        - img
                - row "Krishna Saini k.saini@gmail.com STAFF 1 Feb 1, 2026" [ref=e194]:
                  - cell "Krishna Saini" [ref=e195]
                  - cell "k.saini@gmail.com" [ref=e196]
                  - cell "STAFF" [ref=e197]:
                    - generic [ref=e198]: STAFF
                  - cell "1" [ref=e199]
                  - cell "Feb 1, 2026" [ref=e200]
                  - cell [ref=e201]:
                    - combobox [ref=e202]:
                      - generic: Staff
                      - img
                  - cell [ref=e203]:
                    - generic [ref=e204]:
                      - button [ref=e205]:
                        - img
                      - button [ref=e206]:
                        - img
                - row "keshav Chaudhary skeshav15april@gmail.com STUDENT 2023283 Feb 1, 2026" [ref=e207]:
                  - cell "keshav Chaudhary" [ref=e208]
                  - cell "skeshav15april@gmail.com" [ref=e209]
                  - cell "STUDENT" [ref=e210]:
                    - generic [ref=e211]: STUDENT
                  - cell "2023283" [ref=e212]
                  - cell "Feb 1, 2026" [ref=e213]
                  - cell [ref=e214]:
                    - combobox [ref=e215]:
                      - generic: Student
                      - img
                  - cell [ref=e216]:
                    - generic [ref=e217]:
                      - button [ref=e218]:
                        - img
                      - button [ref=e219]:
                        - img
  - button "Open Next.js Dev Tools" [ref=e225] [cursor=pointer]:
    - img [ref=e226]
  - alert [ref=e229]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Dashboard Operations', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Login before each test
  7  |     await page.goto('/auth/login');
  8  |     await page.fill('input[type="email"]', 'admin1@gmail.com');
  9  |     await page.fill('input[type="password"]', '123456');
  10 |     await page.click('button:has-text("Sign in")');
  11 |     await expect(page).toHaveURL('/admin');
  12 |   });
  13 | 
  14 |   test('View User Management data modal', async ({ page }) => {
  15 |     // Go to User Management page
  16 |     await page.goto('/admin/users');
  17 |     
  18 |     // Expect at least one user with an eye icon
  19 |     const eyeButton = page.locator('button', { has: page.locator('svg.lucide-eye') }).first();
  20 |     await expect(eyeButton).toBeVisible();
  21 |     
  22 |     // Click the eye icon
  23 |     await eyeButton.click();
  24 |     
  25 |     // Verify the modal opens and tabs are present
  26 |     await expect(page.locator('text=Profile')).toBeVisible();
  27 |     await expect(page.locator('text=Equipment Loans')).toBeVisible();
  28 |     await expect(page.locator('text=Gym Activity')).toBeVisible();
  29 |     
  30 |     // Close the modal by hitting Escape
  31 |     await page.keyboard.press('Escape');
  32 |   });
  33 | 
  34 |   test('Deletion safeguard warning appears', async ({ page }) => {
  35 |     // Go to User Management
  36 |     await page.goto('/admin/users');
  37 |     
  38 |     // Click trash icon for the first user
  39 |     const trashButton = page.locator('button', { has: page.locator('svg.lucide-trash-2') }).first();
> 40 |     await trashButton.click();
     |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  41 |     
  42 |     // Verify modal Warning appears
  43 |     await expect(page.locator('text=Delete User Account?')).toBeVisible();
  44 |     await expect(page.locator('text=Cancel')).toBeVisible();
  45 |     await expect(page.locator('button:has-text("Confirm Delete")')).toBeVisible();
  46 |     
  47 |     // Dismiss it
  48 |     await page.click('button:has-text("Cancel")');
  49 |     await expect(page.locator('text=Delete User Account?')).not.toBeVisible();
  50 |   });
  51 | 
  52 | });
  53 | 
```