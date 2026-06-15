-- Seed data for Equipment Categories
INSERT INTO EQUIPMENT_CATEGORY (name, description, max_loan_days) VALUES
  ('Cricket', 'Cricket bats, balls, pads, gloves, and stumps', 7),
  ('Basketball', 'Basketballs and basketball equipment', 5),
  ('Football', 'Footballs and football equipment', 5),
  ('Snooker', 'Snooker cues, balls, and tables', 3),
  ('Table Tennis', 'Table tennis paddles, balls, and nets', 3),
  ('Tennis', 'Tennis rackets, balls, and accessories', 7)
ON DUPLICATE KEY UPDATE name = name;

-- Seed data for Equipment (15 items total)
INSERT INTO EQUIPMENT (name, category_id, total_quantity, available_quantity, created_at) VALUES
-- Cricket (3 items)
('Cricket Bat Premium', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Cricket'), 8, 8, NOW()),
('Cricket Ball (Set of 6)', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Cricket'), 12, 12, NOW()),
('Cricket Pads with Gloves', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Cricket'), 6, 6, NOW()),

-- Basketball (2 items)
('Basketball Official', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Basketball'), 10, 10, NOW()),
('Basketball Hoop Stand', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Basketball'), 3, 3, NOW()),

-- Football (3 items)
('Football Official Size', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Football'), 12, 12, NOW()),
('Football Training Cones (Set)', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Football'), 5, 5, NOW()),
('Football Shin Guards', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Football'), 15, 15, NOW()),

-- Snooker (2 items)
('Snooker Cue Professional', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Snooker'), 6, 6, NOW()),
('Snooker Ball Set', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Snooker'), 4, 4, NOW()),

-- Table Tennis (2 items)
('Table Tennis Paddle', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Table Tennis'), 15, 15, NOW()),
('Table Tennis Balls (Pack of 20)', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Table Tennis'), 10, 10, NOW()),

-- Tennis (3 items)
('Tennis Racket Carbon', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Tennis'), 10, 10, NOW()),
('Tennis Ball Canister', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Tennis'), 20, 20, NOW()),
('Tennis Court Net', (SELECT category_id FROM EQUIPMENT_CATEGORY WHERE name = 'Tennis'), 2, 2, NOW())
ON DUPLICATE KEY UPDATE total_quantity = VALUES(total_quantity), available_quantity = VALUES(available_quantity);


-- Seed data for EQUIPMENT_LOAN
INSERT INTO EQUIPMENT_LOAN 
(loan_id, equipment_id, student_id, quantity, issued_by, issued_at, due_date, returned_at, returned_by, status, created_at)
VALUES
(1, 8, '101', 1, 2, '2026-02-04 20:20:42', '2026-02-11', '2026-02-04 20:20:49', 2, 'RETURNED', '2026-02-04 20:20:42'),
(2, 4, '2026006', 4, 3, '2026-02-12 09:36:27', '2026-02-19', '2026-02-12 09:41:13', 4, 'RETURNED', '2026-02-12 09:36:27'),
(3, 6, '2026007', 1, 3, '2026-02-12 09:37:02', '2026-02-19', '2026-02-12 09:41:13', 4, 'RETURNED', '2026-02-12 09:37:02'),
(4, 8, '2026007', 2, 3, '2026-02-12 09:37:12', '2026-02-19', '2026-02-12 09:41:12', 4, 'RETURNED', '2026-02-12 09:37:12'),
(5, 7, '2026007', 5, 3, '2026-02-12 09:37:27', '2026-02-19', '2026-02-12 09:41:12', 4, 'RETURNED', '2026-02-12 09:37:27'),
(6, 10, '2024005', 1, 3, '2026-02-12 09:37:55', '2026-02-19', '2026-02-12 09:41:11', 4, 'RETURNED', '2026-02-12 09:37:55'),
(7, 9, '2024005', 2, 3, '2026-02-12 09:38:03', '2026-02-19', '2026-02-12 09:41:10', 4, 'RETURNED', '2026-02-12 09:38:03');
