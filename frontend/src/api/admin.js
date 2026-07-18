import api from "./axios";

// --- Analytics ---
export const fetchOverview = async () => {
  const res = await api.get("/admin/overview");
  return res.data?.data ?? null;
};

export const fetchGrowth = async (metric = "users", range = 30) => {
  const res = await api.get("/admin/growth", { params: { metric, range } });
  return res.data?.data ?? { metric, range, total: 0, series: [] };
};

export const fetchBreakdown = async () => {
  const res = await api.get("/admin/breakdown");
  return res.data?.data ?? null;
};

// --- Account management ---
export const fetchAdminUsers = async (params = {}) => {
  const res = await api.get("/admin/users", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const fetchAdminUserDetail = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data?.data ?? null;
};

export const suspendUser = async (id, reason) => {
  const res = await api.patch(`/admin/users/${id}/suspend`, { reason });
  return res.data?.data ?? null;
};

export const unsuspendUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/unsuspend`);
  return res.data?.data ?? null;
};
