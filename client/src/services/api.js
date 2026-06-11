import axios from "axios";

let getAuthToken = null;

export const setAuthTokenGetter = (tokenGetter) => {
  getAuthToken = tokenGetter;
};

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    const token = await getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;