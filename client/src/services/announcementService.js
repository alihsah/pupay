import api from "./api";

export const getAnnouncements = async () => {
  const response = await api.get("/announcements");
  return response.data;
};

export const getMyAnnouncements = async () => {
  const response = await api.get("/announcements/student/my");
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  const response = await api.post("/announcements", announcementData);
  return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
  const response = await api.put(`/announcements/${id}`, announcementData);
  return response.data;
};

export const updateAnnouncementStatus = async (id, status) => {
  const response = await api.patch(`/announcements/${id}/status`, { status });
  return response.data;
};