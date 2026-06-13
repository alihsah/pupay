CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id INT NOT NULL,
  student_id INT NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (announcement_id, student_id),
  INDEX idx_announcement_reads_student (student_id),
  CONSTRAINT fk_announcement_reads_announcement
    FOREIGN KEY (announcement_id)
    REFERENCES announcements(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_announcement_reads_student
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE
);
