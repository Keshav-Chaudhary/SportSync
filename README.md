# SportSync - Gym & Equipment Management System

A comprehensive Role-Based Access Control (RBAC) web application for managing gym facilities, sports equipment inventory, student memberships, and staff operations. Built with Next.js, Tailwind CSS, shadcn/ui, and MySQL.

## 🚀 Features

- **Role-Based Access**: Specialized portals for Admins, Staff, and Students.
- **Gym Entry Management**: Real-time facility occupancy monitoring. Gym check-in and check-out entries are recorded exclusively by Staff attendants at the front desk.
- **Equipment Inventory**: Manage equipment catalog, track usage, and monitor quantities.
- **Loans System**: Equipment loan issues and return processing. Transactions are recorded and managed exclusively by Staff; students have a read-only dashboard view to search gear and track active loans.
- **Interactive Dashboards**: Comprehensive analytics and metrics for all user roles.
- **Admin Tools**: Built-in SQL Playground, System Health Monitoring, and Trigger Overview.

## 📂 Project Documentation

For detailed information about specific parts of the system, refer to the specialized documentation:

- 🛡️ [Security Guidelines](./SECURITY_README.md)
- 🏗️ [Project Structure](./PROJECT_STRUCTURE_README.md)
- 📊 [Project Status Report](./PROJECT_STATUS_REPORT.md)
- 👑 [Admin Features](./README-ADMIN.md)
- 👔 [Staff Operations](./README-STAFF.md)
- 🎓 [Student Portal](./README-STUDENT.md)
- ♿ [Accessibility Guide](./ACCESSIBILITY_README.md)
- 🔍 [Audit Logs](./AUDIT_README.md)
- 💎 [Code Quality](./CODE_QUALITY_README.md)
- 🤝 [Team Setup Guide](./TEAM_SETUP_GUIDE.md)

## 📸 UI Showcase

SportSync features a fully responsive design tailored for both desktop workstations and mobile devices. Below is a visual walkthrough of the system.

### 🌐 Landing & Authentication

| Desktop View | Mobile View |
| :---: | :---: |
| <img src="./public/showcase/landing_desktop.png" width="550" alt="Landing Page Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Landing Page** | <img src="./public/showcase/landing_mobile.png" width="180" alt="Landing Page Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Landing Page (Mobile)** |
| <img src="./public/showcase/login_desktop.png" width="550" alt="Login Page Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Login Portal** | *(Responsive Login Card)* |

---

### 👑 Admin Portal

The administrative suite provides total control over users, equipment, system configuration, database triggers, and metrics.

| Desktop View | Mobile View |
| :---: | :---: |
| <img src="./public/showcase/admin_dashboard_desktop.png" width="550" alt="Admin Dashboard Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Admin Dashboard Overview** | <img src="./public/showcase/admin_dashboard_mobile.png" width="180" alt="Admin Dashboard Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Admin Dashboard (Mobile)** |
| <img src="./public/showcase/admin_users_desktop.png" width="550" alt="Admin Users Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **User Management & CRUD** | <img src="./public/showcase/admin_users_mobile.png" width="180" alt="Admin Users Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **User Management (Mobile)** |
| <img src="./public/showcase/admin_equipment_desktop.png" width="550" alt="Admin Equipment Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Equipment Inventory Catalog** | <img src="./public/showcase/admin_equipment_mobile.png" width="180" alt="Admin Equipment Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Equipment Catalog (Mobile)** |
| <img src="./public/showcase/admin_system_desktop.png" width="550" alt="Admin System Status Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **System Diagnostics & Health** | <img src="./public/showcase/admin_system_mobile.png" width="180" alt="Admin System Status Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **System Status (Mobile)** |
| <img src="./public/showcase/admin_analytics_desktop.png" width="550" alt="Admin Analytics Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Analytics Dashboard & Reports** | *(Desktop optimized detailed layout)* |
| <img src="./public/showcase/admin_sql_desktop.png" width="550" alt="Admin SQL Playground Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **SQL Playground & Database Triggers** | *(Developer features restricted to desktop)* |

---

### 👔 Staff Portal

Staff accounts manage daily gym operations, equipment loan workflows, returns, and facility logs.

| Desktop View | Mobile View |
| :---: | :---: |
| <img src="./public/showcase/staff_dashboard_desktop.png" width="550" alt="Staff Dashboard Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Staff Dashboard** | <img src="./public/showcase/staff_dashboard_mobile.png" width="180" alt="Staff Dashboard Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Staff Dashboard (Mobile)** |
| <img src="./public/showcase/staff_equipment_desktop.png" width="550" alt="Staff Equipment Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Staff Equipment Inventory** | <img src="./public/showcase/staff_equipment_mobile.png" width="180" alt="Staff Equipment Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Equipment Manager (Mobile)** |
| <img src="./public/showcase/staff_gym_desktop.png" width="550" alt="Staff Gym Access Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Gym Access Control Logs** | <img src="./public/showcase/staff_gym_mobile.png" width="180" alt="Staff Gym Access Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Gym Access Logs (Mobile)** |
| <img src="./public/showcase/staff_loans_desktop.png" width="550" alt="Staff Loans Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Loan Verification & Processing** | *(Desktop optimized control panel)* |

---

### 🎓 Student Portal

Students can monitor facility occupancy, browse the equipment catalog, track active loans/history, and download their reports. (Note: Borrowing transactions and gym entry sessions are recorded exclusively by Staff attendants).

| Desktop View | Mobile View |
| :---: | :---: |
| <img src="./public/showcase/student_dashboard_desktop.png" width="550" alt="Student Dashboard Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Student Dashboard** | <img src="./public/showcase/student_dashboard_mobile.png" width="180" alt="Student Dashboard Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Student Dashboard (Mobile)** |
| <img src="./public/showcase/student_equipment_desktop.png" width="550" alt="Student Equipment Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Equipment Catalog Search & Browse (Read-only)** | <img src="./public/showcase/student_equipment_mobile.png" width="180" alt="Student Equipment Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Catalog Browser (Mobile)** |
| <img src="./public/showcase/student_gym_desktop.png" width="550" alt="Student Gym Access Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Gym Occupancy & Access Status (Read-only)** | <img src="./public/showcase/student_gym_mobile.png" width="180" alt="Student Gym Access Mobile" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Gym Status (Mobile)** |
| <img src="./public/showcase/student_loans_desktop.png" width="550" alt="Student Loans Desktop" style="border-radius: 8px; border: 1px solid #ddd;" /> <br> **Active Loans & History** | *(Desktop optimized detail table)* |

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: MySQL (`mysql2` package)
- **Authentication**: JWT, bcryptjs
- **Form Handling**: React Hook Form, Zod

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL Database

### Installation

1. Clone the repository and navigate to the project directory (`SportSync`).
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Set up environment variables in `.env.local`.
4. Run database scripts in `/scripts` to create tables and seed data.
5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Running Tests

A comprehensive E2E and API testing suite is set up using Playwright to test all user roles, navigation flow, API constraints, and reports:

1. Ensure the development server is running locally:
   ```bash
   npm run dev
   ```
2. Run the test suite:
   ```bash
   npx playwright test
   ```
3. To view the HTML test reports:
   ```bash
   npx playwright show-report
   ```

## 👨‍💻 Default Test Credentials

- **Admin**: `admin1@gmail.com` / `123456`
- **Staff**: `staff5@gmail.com` / `123456`
- **Student**: `student5@gmail.com` / `123456`

## 📝 License

Private / Academic Project
