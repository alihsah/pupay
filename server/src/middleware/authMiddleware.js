import { getAuth } from "@clerk/express";
import clerkClient from "../config/clerk.js";
import db from "../config/db.js";

export const protect = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
};

export const attachUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const role = clerkUser.privateMetadata?.role;

    if (role === "admin" || role === "treasurer") {
      req.user = {
        clerkUserId: userId,
        role: "admin",
        email: clerkUser.emailAddresses?.[0]?.emailAddress,

      };

      return next();
    }

    const emails = clerkUser.emailAddresses.map((email) => email.emailAddress);

    const [students] = await db.query(
      `
      SELECT *
      FROM students
      WHERE personal_email IN (?)
      LIMIT 1
      `,
      [emails, emails]
    );

    if (students.length === 0) {
      return res.status(403).json({
        message: "Your account is not registered as a student.",
      });
    }

    const student = students[0];

    if (student.status !== "active") {
      return res.status(403).json({
        message: "Your student account is inactive.",
      });
    }

    if (!student.clerk_user_id) {
      await db.query(
        `
        UPDATE students
        SET clerk_user_id = ?
        WHERE id = ?
        `,
        [userId, student.id]
      );
    } else if (student.clerk_user_id !== userId) {
      return res.status(403).json({
        message: "This student record is already linked to another account.",
      });
    }

    req.user = {
      clerkUserId: userId,
      role: "student",
      studentId: student.id,
      studentNumber: student.student_number,
      fullName: student.full_name,
      course: student.course,
      yearLevel: student.year_level,
      section: student.section,
      email: emails[0],
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Authentication failed." });
  }
};