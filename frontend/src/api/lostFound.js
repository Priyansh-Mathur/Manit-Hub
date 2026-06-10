import api from "./axios";

export const fetchLostFoundItems = async (params = {}) => {
  const res = await api.get("/lost-found", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const createLostFoundItem = async (formData) => {
  const res = await api.post("/lost-found", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data ?? null;
};

export const updateLostFoundStatus = async (id, status) => {
  const res = await api.patch(`/lost-found/${id}/status`, { status });
  return res.data?.data ?? null;
};

export const deleteLostFoundItem = async (id) => {
  const res = await api.delete(`/lost-found/${id}`);
  return res.data?.data ?? null;
};
