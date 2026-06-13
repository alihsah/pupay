import api from "./api";

export const getStudentUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/student/unread-count");
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};
