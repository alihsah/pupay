import api from "./api";

export const getCollections = async () => {
  const response = await api.get("/collections");
  return response.data;
};

export const getMyCollections = async () => {
  const response = await api.get("/collections/student/my");
  return response.data;
};

export const getCollectionById = async (id) => {
  const response = await api.get(`/collections/${id}`);
  return response.data;
};

export const getCollectionProgress = async (id) => {
  const response = await api.get(`/collections/${id}/progress`);
  return response.data;
};

export const createCollection = async (collectionData) => {
  const response = await api.post("/collections", collectionData);
  return response.data;
};

export const updateCollection = async (id, collectionData) => {
  const response = await api.put(`/collections/${id}`, collectionData);
  return response.data;
};

export const updateCollectionStatus = async (id, status, options = {}) => {
  const response = await api.patch(`/collections/${id}/status`, {
    status,
    ...options,
  });
  return response.data;
};
