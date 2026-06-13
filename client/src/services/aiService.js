import api from "./api";

export const generateAIReminder = async (payload) => {
  const response = await api.post("/ai/reminder", payload);
  return response.data;
};

export const generateAICollectionSummary = async (payload) => {
  const response = await api.post("/ai/collection-summary", payload);
  return response.data;
};

export const generateAIAnnouncement = async (payload) => {
  const response = await api.post("/ai/announcement", payload);
  return response.data;
};