# Audit Logging & Historical Tracking

The Gym & Sports System employs robust auditing and history tracking to ensure accountability across all gym operations and equipment loans.

## 1. Gym Entry Logging
- **Time Tracking**: Every entry logs an exact `entry_time`. When a student exits, the `exit_time` is recorded, allowing for precise duration calculation.
- **Staff Accountability**: Each gym entry created manually by a staff member records their `staff_id` under `recorded_by`.
- **Historical View**: Staff members can view their personal audit trail of students they have checked in and out in the Gym Dashboard.

## 2. Equipment Loan Tracking
- **Lifecycle Auditing**: Loans track the moment they are `issued_at` and who authorized it (`issued_by`). When returned, the system stamps `returned_at` and `returned_by`.
- **Status Persistence**: Overdue equipment is flagged automatically based on `due_date`. Historical loans are never deleted during normal flow; their status simply changes to `RETURNED`, acting as an unalterable receipt.
- **Top-down Analytics**: The database supports aggregated audits, powering the staff and admin analytical charts (e.g., most frequently loaned items, peak usage months).

## 3. Account Activity
- **Admin Oversight**: The Admin Panel features an overarching User Management portal that displays the granular history of any account in the system.
  - Viewing a user reveals their current active loans, lifetime gym check-ins, and specific profile data.
  - Ensures a full paper-trail for any user registered in the system.

## 4. Deletion Policies
- Deleting an asset or user account requires careful auditing. 
- Historical constraints block deletion of users who have tied transactional data (e.g., a staff member who processed a loan must remain in the database for historical integrity, or their actions must be safely reassigned/archived).
