# SportSync - Gym & Equipment Management System

A comprehensive Role-Based Access Control (RBAC) web application for managing gym facilities, sports equipment inventory, student memberships, and staff operations. Built with Next.js, Tailwind CSS, shadcn/ui, and MySQL.

## 🚀 Features

- **Role-Based Access**: Specialized portals for Admins, Staff, and Students.
- **Gym Entry Management**: Track real-time gym occupancy and logs.
- **Equipment Inventory**: Manage equipment catalog, track usage, and monitor quantities.
- **Loans System**: Handle borrowing and returning of sports equipment with overdue tracking.
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

## 👨‍💻 Default Test Credentials

- **Admin**: `admin1@gmail.com` / `123456`
- **Staff**: `staff1@gmail.com` / `123456`
- **Student**: `student1@gmail.com` / `123456`

## 📝 License

Private / Academic Project
