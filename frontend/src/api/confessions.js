import api from "./axios";

export const fetchConfessions = async (params = {}) => {
  const res = await api.get("/confessions", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const postConfession = async (content) => {
  const res = await api.post("/confessions", { content });
  return res.data?.data ?? null;
};

export const reactToConfession = async (id, type) => {
  const res = await api.post(`/confessions/${id}/react`, { type });
  return res.data?.data ?? null;
};

export const commentOnConfession = async (id, content) => {
  const res = await api.post(`/confessions/${id}/comments`, { content });
  return res.data?.data ?? null;
};

export const reportConfession = async (id, reason) => {
  const res = await api.post(`/confessions/${id}/report`, { reason });
  return res.data?.data ?? null;
};

export const deleteConfession = async (id) => {
  const res = await api.delete(`/confessions/${id}`);
  return res.data?.data ?? null;
};
