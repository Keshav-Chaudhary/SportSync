-- Sports Equipment Lending and Gym Entry Management System
-- MySQL Database Schema

-- USER_ACCOUNT table
CREATE TABLE USER_ACCOUNT (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- USER_ROLES table
CREATE TABLE USER_ROLES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('STUDENT', 'STAFF', 'ADMIN') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER_ACCOUNT(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- STUDENT table
CREATE TABLE STUDENT (
    roll_no VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    is_hosteler BOOLEAN NOT NULL,
    room_no VARCHAR(10),
    hostel_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER_ACCOUNT(user_id)
) ENGINE=InnoDB;

-- STAFF table
CREATE TABLE STAFF (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER_ACCOUNT(user_id)
) ENGINE=InnoDB;

-- EQUIPMENT_CATEGORY table
CREATE TABLE EQUIPMENT_CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    max_loan_days INT NOT NULL CHECK (max_loan_days > 0)
) ENGINE=InnoDB;

-- EQUIPMENT table (NOTE: No description column - description is in EQUIPMENT_CATEGORY)
CREATE TABLE EQUIPMENT (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 0),
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES EQUIPMENT_CATEGORY(category_id)
) ENGINE=InnoDB;

-- GYM_ENTRY table
CREATE TABLE GYM_ENTRY (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    recorded_by INT NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES STUDENT(roll_no),
    FOREIGN KEY (recorded_by) REFERENCES STAFF(staff_id)
) ENGINE=InnoDB;

-- EQUIPMENT_LOAN table
CREATE TABLE EQUIPMENT_LOAN (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    issued_by INT NOT NULL,
    issued_at DATETIME NOT NULL,
    due_date DATE NOT NULL,
    returned_at DATETIME,
    returned_by INT,
    status ENUM('ISSUED', 'RETURNED', 'OVERDUE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id),
    FOREIGN KEY (student_id) REFERENCES STUDENT(roll_no),
    FOREIGN KEY (issued_by) REFERENCES STAFF(staff_id),
    FOREIGN KEY (returned_by) REFERENCES STAFF(staff_id)
) ENGINE=InnoDB;

-- Constraints
ALTER TABLE STUDENT
ADD CONSTRAINT chk_hosteler
CHECK (
    (is_hosteler = TRUE AND hostel_name IS NOT NULL)
    OR
    (is_hosteler = FALSE AND hostel_name IS NULL)
);

ALTER TABLE EQUIPMENT
ADD CONSTRAINT chk_quantity
CHECK (available_quantity <= total_quantity);

ALTER TABLE GYM_ENTRY
ADD CONSTRAINT chk_exit_time
CHECK (exit_time IS NULL OR exit_time > entry_time);

ALTER TABLE EQUIPMENT_LOAN
ADD CONSTRAINT chk_due_date
CHECK (due_date >= DATE(issued_at));

-- Indexes
CREATE INDEX idx_user_roles_user_id ON USER_ROLES(user_id);
CREATE INDEX idx_student_user_id ON STUDENT(user_id);
CREATE INDEX idx_staff_user_id ON STAFF(user_id);
CREATE INDEX idx_equipment_category ON EQUIPMENT(category_id);
CREATE INDEX idx_gym_entry_student ON GYM_ENTRY(student_id);
CREATE INDEX idx_gym_entry_time ON GYM_ENTRY(entry_time);
CREATE INDEX idx_loan_student ON EQUIPMENT_LOAN(student_id);
CREATE INDEX idx_loan_equipment ON EQUIPMENT_LOAN(equipment_id);
CREATE INDEX idx_loan_status ON EQUIPMENT_LOAN(status);


-- Triggers

--Trigger-1: Issue Equipment

DELIMITER //

CREATE TRIGGER trg_issue_equipment
AFTER INSERT ON EQUIPMENT_LOAN
FOR EACH ROW
BEGIN
    -- Prevent negative stock at the DB level
    DECLARE current_available INT;
    SELECT available_quantity INTO current_available
    FROM EQUIPMENT
    WHERE equipment_id = NEW.equipment_id;

    IF current_available IS NULL OR current_available < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient equipment available';
    END IF;

    UPDATE EQUIPMENT
    SET available_quantity = available_quantity - NEW.quantity
    WHERE equipment_id = NEW.equipment_id;
END;
//

DELIMITER ;


--Trigger-2: Return Equipment

DELIMITER //

CREATE TRIGGER trg_return_equipment
AFTER UPDATE ON EQUIPMENT_LOAN
FOR EACH ROW
BEGIN
    -- Only restore stock when status transitions into RETURNED
    IF NEW.status = 'RETURNED' AND OLD.status != 'RETURNED' THEN
        UPDATE EQUIPMENT
        SET available_quantity = available_quantity + NEW.quantity
        WHERE equipment_id = NEW.equipment_id;
    END IF;
END;
//

DELIMITER ;