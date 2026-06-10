import api from "./axios";

export const fetchDocuments = async (params = {}) => {
  const res = await api.get("/documents", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const fetchMyDocuments = async () => {
  const res = await api.get("/documents/me");
  return res.data?.data ?? [];
};

export const uploadDocument = async (formData) => {
  const res = await api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data ?? null;
};

export const trackDownload = async (documentId) => {
  const res = await api.post(`/documents/${documentId}/download`);
  return res.data?.data ?? null;
};

export const deleteDocument = async (documentId) => {
  const res = await api.delete(`/documents/${documentId}`);
  return res.data?.data ?? null;
};
