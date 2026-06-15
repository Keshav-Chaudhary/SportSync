# Code Quality Standards & Guidelines

This document outlines the coding standards, patterns, and quality guidelines established for the Gym & Sports System.

## 1. Architecture & Structure
- **Framework**: Next.js App Router paradigm.
- **Component Design**: Functional components with React Hooks. UI components are separated from business logic where possible.
- **Modularity**: Shared UI components are stored in `components/ui` (Shadcn), while domain-specific components reside in `components/admin`, `components/staff`, and `components/student`.

## 2. API Design & Data Fetching
- **RESTful Endpoints**: All database interactions occur via secure `/api/*` routes.
- **Server-Side Validation**: All API inputs (params, body) are validated before processing.
- **Error Handling**: APIs consistently return meaningful HTTP status codes and JSON error messages (`{ error: string }`).

## 3. Database Interactions
- **Connection Pooling**: Uses standard MySQL pooling to prevent connection exhaustion.
- **Transactions**: Complex operations (like processing a loan return that also affects stock quantity) are wrapped in `BEGIN`, `COMMIT`, and `ROLLBACK` blocks to maintain ACID properties.
- **Parameterized Queries**: Strict use of parameterized statements to prevent SQL Injection.

## 4. UI/UX Consistency
- **Responsive Layouts**: Components must gracefully scale from mobile to desktop using Tailwind grid/flex utilities.
- **Feedback**: Forms and data-fetching hooks implement loading spinners (e.g., `<Loader2>`) and success/error alert banners to ensure a smooth user experience.
- **Modern Aesthetics**: Leveraging glassmorphism, animated cards (`animate-in fade-in`), and semantic badges (e.g., `destructive` for overdue items).

## 5. Testing & Verification
- **E2E Testing**: UI features, navigation, and user actions (Admin, Staff, and Student portals) are verified using Playwright.
- **API Testing**: Role-based access control (RBAC) and raw payload outputs are tested via Playwright API request contexts.
- **Sequenced Execution**: Tests run sequentially with 1 worker to ensure database operations do not conflict.

## 6. Maintenance
- Regular audits of `package.json` dependencies.
- Removal of dead code, unused imports, and console logs before committing to production branches.
