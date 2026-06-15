# Security Guidelines & Posture

Security is a primary focus of the Gym & Sports System. This document details the security mechanisms implemented across the application.

## 1. Authentication & Authorization
- **Session Management**: Custom JWT (JSON Web Tokens) used for session state, stored securely in HTTP-only, SameSite cookies.
- **Password Security**: Passwords are securely hashed using `bcryptjs` prior to database storage. Plaintext passwords are never stored.
- **Role-Based Access Control (RBAC)**: Enforced via Next.js Middleware. Users are restricted to routes corresponding to their role (`ADMIN`, `STAFF`, `STUDENT`). 
  - APIs also re-verify the session role server-side before executing privileged commands.

## 2. Data Protection
- **SQL Injection Prevention**: All queries utilize parameterized inputs via `mysql2/promise`.
- **Data Deletion Safeguards**: 
  - Restrictive constraints on sensitive tables. 
  - Admins attempting to delete a user receive contextual warnings. System prevents deletion of staff/students with active dependencies (e.g., unreturned loans, historical audit records).
  - Prevention against deleting the sole system administrator.

## 3. Endpoint Security
- **Strict Method Checking**: APIs strictly define and export specific HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
- **Input Sanitization**: User inputs and roll numbers are parsed and validated strictly to prevent cross-site scripting (XSS) and injection vectors.

## 4. Client-Side Security
- **No Sensitive Data Exposure**: The frontend receives only the data explicitly required for rendering. Server-side queries do not leak hashes or irrelevant metadata.
- **Protected UI elements**: Admin/Staff controls (like specific Delete/Edit buttons) are conditionally rendered and securely backed by API validation.
