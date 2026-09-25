import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong. Please try again.";
    return Promise.reject({ ...error, normalizedMessage: message });
  },
);

export default api;

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  saveFcmToken: (fcmToken) => api.post("/auth/fcm-token", { fcmToken }),
};

export const medicineApi = {
  getAll: () => api.get("/api/medicines"),
  getLowStock: () => api.get("/api/medicines/low-stock"),
  getById: (id) => api.get(`/api/medicines/${id}`),
  create: (data) => api.post("/api/medicines", data),
  update: (id, data) => api.put(`/api/medicines/${id}`, data),
  delete: (id) => api.delete(`/api/medicines/${id}`),
  bulkCreate: (medicines) => api.post("/api/medicines/bulk", { medicines }),
  updateDoseStatus: (medicineId, scheduleId, body) =>
    api.patch(
      `/api/medicines/${medicineId}/schedule/${scheduleId}/status`,
      body,
    ),
};

// ─── Prescription endpoints ───────────────────────────────────────
export const prescriptionApi = {
  parse: (file) => {
    const formData = new FormData();
    formData.append("prescription", file);
    return api.post("/api/prescriptions/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
