import api from "./axios";

export const reportContent = async (payload) => {
  const res = await api.post("/reports", payload);
  return res.data?.data ?? null;
};

export const fetchReports = async (params = {}) => {
  const res = await api.get("/reports", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const handleReport = async (id, action) => {
  const res = await api.patch(`/reports/${id}`, { action });
  return res.data?.data ?? null;
};
