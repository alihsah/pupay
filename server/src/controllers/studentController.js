import db from "../config/db.js";
import ExcelJS from "exceljs";
import { assignStudentToMatchingActiveCollections } from "../services/studentCollectionAssignmentService.js";

const assignMatchingCollectionsSafely = async (studentId, context) => {
  try {
    return await assignStudentToMatchingActiveCollections(studentId);
  } catch (error) {
    console.warn(
      `Student collection assignment failed after ${context}:`,
      error?.message || error
    );

    return { assignedCount: 0, failed: true };
  }
};

export const countTargetStudents = async (req, res) => {
  try {
    const {
      course = "ALL",
      year_level = "ALL",
      section = "ALL",
    } = req.query;

    const filters = ["status = 'active'"];
    const values = [];

    if (course !== "ALL") {
      filters.push("course = ?");
      values.push(course);
    }

    if (year_level !== "ALL") {
      filters.push("year_level = ?");
      values.push(year_level);
    }

    if (section !== "ALL") {
      filters.push("section = ?");
      values.push(section);
    }

    const [result] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM students
      WHERE ${filters.join(" AND ")}
      `,
      values
    );

    res.status(200).json({
      total: Number(result[0].total || 0),
    });
  } catch (error) {
    console.error("Count target students error:", error);
    res.status(500).json({
      message: "Failed to count target students.",
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT
        id,
        student_number,
        full_name,
        personal_email,
        course,
        year_level,
        section,
        status,
        clerk_user_id,
        created_at,
        updated_at
      FROM students
      ORDER BY created_at DESC
    `);

    res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Failed to retrieve students." });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await db.query(
      `
      SELECT
        id,
        student_number,
        full_name,
        personal_email,
        course,
        year_level,
        section,
        status,
        clerk_user_id,
        created_at,
        updated_at
      FROM students
      WHERE id = ?
      `,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json(students[0]);
  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({ message: "Failed to retrieve student." });
  }
};

export const createStudent = async (req, res) => {
  try {
    const {
      student_number,
      full_name,
      personal_email,
      course,
      year_level,
      section,
      status = "active",
    } = req.body;

    if (!student_number || !full_name) {
      return res.status(400).json({
        message: "Student number and full name are required.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO students (
        student_number,
        full_name,
        personal_email,
        course,
        year_level,
        section,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        student_number,
        full_name,
        personal_email || null,
        course || null,
        year_level || null,
        section || null,
        status,
      ]
    );

    if (status === "active") {
      await assignMatchingCollectionsSafely(result.insertId, "student creation");
    }

    res.status(201).json({ message: "Student created successfully." });
  } catch (error) {
    console.error("Create student error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Student number or personal email already exists.",
      });
    }

    res.status(500).json({ message: "Failed to create student." });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      student_number,
      full_name,
      personal_email,
      course,
      year_level,
      section,
      status,
    } = req.body;

    const nextStatus = status || "active";

    await db.query(
      `
      UPDATE students
      SET
        student_number = ?,
        full_name = ?,
        personal_email = ?,
        course = ?,
        year_level = ?,
        section = ?,
        status = ?
      WHERE id = ?
      `,
      [
        student_number,
        full_name,
        personal_email || null,
        course || null,
        year_level || null,
        section || null,
        nextStatus,
        id,
      ]
    );

    if (nextStatus === "active") {
      await assignMatchingCollectionsSafely(id, "student update");
    }

    res.status(200).json({ message: "Student updated successfully." });
  } catch (error) {
    console.error("Update student error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Student number or personal email already exists.",
      });
    }

    res.status(500).json({ message: "Failed to update student." });
  }
};

export const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or inactive.",
      });
    }

    await db.query(
      `
      UPDATE students
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    if (status === "active") {
      await assignMatchingCollectionsSafely(id, "student status update");
    }

    res.status(200).json({ message: "Student status updated successfully." });
  } catch (error) {
    console.error("Update student status error:", error);
    res.status(500).json({ message: "Failed to update student status." });
  }
};

export const unlinkStudentAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      UPDATE students
      SET clerk_user_id = NULL
      WHERE id = ?
      `,
      [id]
    );

    res.status(200).json({ message: "Student account unlinked successfully." });
  } catch (error) {
    console.error("Unlink student account error:", error);
    res.status(500).json({ message: "Failed to unlink student account." });
  }
};

export const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No Excel file uploaded." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({ message: "Excel file is empty." });
    }

    const headers = [];

    worksheet.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value).trim());
    });

    const requiredColumns = ["student_number", "full_name"];

    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(", ")}`,
      });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};

      headers.forEach((header, index) => {
        const cell = row.getCell(index + 1);
        rowData[header] = cell.value ? String(cell.value).trim() : "";
      });

      if (!rowData.student_number || !rowData.full_name) {
        skipped++;
        continue;
      }

      const status = rowData.status === "inactive" ? "inactive" : "active";

      const [existing] = await db.query(
        "SELECT id FROM students WHERE student_number = ?",
        [rowData.student_number]
      );

      if (existing.length > 0) {
        await db.query(
          `
          UPDATE students
          SET
            full_name = ?,
            personal_email = ?,
            course = ?,
            year_level = ?,
            section = ?,
            status = ?
          WHERE student_number = ?
          `,
          [
            rowData.full_name,
            rowData.personal_email || null,
            rowData.course || null,
            rowData.year_level || null,
            rowData.section || null,
            status,
            rowData.student_number,
          ]
        );

        if (status === "active") {
          await assignMatchingCollectionsSafely(
            existing[0].id,
            "student import update"
          );
        }

        updated++;
      } else {
        const [result] = await db.query(
          `
          INSERT INTO students (
            student_number,
            full_name,
            personal_email,
            course,
            year_level,
            section,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            rowData.student_number,
            rowData.full_name,
            rowData.personal_email || null,
            rowData.course || null,
            rowData.year_level || null,
            rowData.section || null,
            status,
          ]
        );

        if (status === "active") {
          await assignMatchingCollectionsSafely(
            result.insertId,
            "student import insert"
          );
        }

        inserted++;
      }
    }

    res.status(200).json({
      message: "Student import completed.",
      summary: { inserted, updated, skipped },
    });
  } catch (error) {
    console.error("Import students error:", error);

    res.status(500).json({
      message: "Failed to import students.",
    });
  }
};

