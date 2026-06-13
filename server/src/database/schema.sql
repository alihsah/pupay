CREATE TABLE IF NOT EXISTS students (
id INT NOT NULL AUTO_INCREMENT,
student_number VARCHAR(50) NOT NULL,
full_name VARCHAR(150) NOT NULL,
personal_email VARCHAR(150) NOT NULL,
course ENUM('BSIT','BSHM','BSOA','BSCPE') NOT NULL,
year_level ENUM('1st Year','2nd Year','3rd Year','4th Year') NOT NULL,
section ENUM('1','2') NOT NULL,
status ENUM('active','inactive') DEFAULT 'active',
clerk_user_id VARCHAR(100) DEFAULT NULL,
created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY student_number (student_number),
UNIQUE KEY personal_email (personal_email),
UNIQUE KEY clerk_user_id (clerk_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collections (
id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(150) NOT NULL,
description TEXT,
goal_amount DECIMAL(10,2) DEFAULT NULL,
amount DECIMAL(10,2) NOT NULL,
course ENUM('BSIT','BSHM','BSOA','BSCPE','ALL') DEFAULT 'ALL',
year_level ENUM('1st Year','2nd Year','3rd Year','4th Year','ALL') DEFAULT 'ALL',
section ENUM('1','2','ALL') DEFAULT 'ALL',
due_date DATE NOT NULL,
status ENUM('active','closed','archived') DEFAULT 'active',
is_locked TINYINT(1) DEFAULT 0,
locked_at DATETIME DEFAULT NULL,
created_by VARCHAR(100) DEFAULT NULL,
created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(150) NOT NULL,
message TEXT NOT NULL,
type ENUM('general','payment_reminder','deadline') DEFAULT 'general',
course ENUM('ALL','BSIT','BSHM','BSOA','BSCPE') DEFAULT 'ALL',
year_level ENUM('ALL','1st Year','2nd Year','3rd Year','4th Year') DEFAULT 'ALL',
section ENUM('ALL','1','2') DEFAULT 'ALL',
status ENUM('active','archived') DEFAULT 'active',
created_by VARCHAR(100) DEFAULT NULL,
created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
id INT NOT NULL AUTO_INCREMENT,
student_id INT NOT NULL,
collection_id INT NOT NULL,
amount_due DECIMAL(10,2) NOT NULL,
amount_paid DECIMAL(10,2) DEFAULT 0.00,
status ENUM('pending','paid','overdue') DEFAULT 'pending',
payment_method ENUM('cash','gcash','card') DEFAULT 'cash',
reference_number VARCHAR(100) DEFAULT NULL,
remarks TEXT,
paid_at DATETIME DEFAULT NULL,
created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id),
KEY student_id (student_id),
KEY collection_id (collection_id),
CONSTRAINT payments_student_fk
FOREIGN KEY (student_id)
REFERENCES students(id),
CONSTRAINT payments_collection_fk
FOREIGN KEY (collection_id)
REFERENCES collections(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcement_reads (
announcement_id INT NOT NULL,
student_id INT NOT NULL,
read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (announcement_id, student_id),
KEY idx_announcement_reads_student (student_id),
CONSTRAINT fk_announcement_reads_announcement
FOREIGN KEY (announcement_id)
REFERENCES announcements(id)
ON DELETE CASCADE,
CONSTRAINT fk_announcement_reads_student
FOREIGN KEY (student_id)
REFERENCES students(id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;