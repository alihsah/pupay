export const allowOwnStudentRecordOrAdmin = (req, res, next) => {
  const requestedStudentId = Number(req.params.studentId);

  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.role === "student" && req.user.studentId === requestedStudentId) {
    return next();
  }

  return res.status(403).json({
    message: "You can only access your own student records.",
  });
};