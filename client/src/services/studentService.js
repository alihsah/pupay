import api from "./api";

export const getStudents = async () => {
  const response = await api.get("/students");
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post("/students", studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

export const updateStudentStatus = async (id, status) => {
  const response = await api.patch(`/students/${id}/status`, { status });
  return response.data;
};

export const unlinkStudentAccount = async (id) => {
  const response = await api.patch(`/students/${id}/unlink`);
  return response.data;
};

export const importStudents = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/students/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const countTargetStudents = async ({ course, year_level, section }) => {
  const response = await api.get("/students/count-target", {
    params: {
      course,
      year_level,
      section,
    },
  });

  return response.data;
};