import api from "./axios";

export const fetchOffers = async (params = {}) => {
  const res = await api.get("/offers", { params });
  return res.data?.data ?? [];
};

export const makeOffer = async (payload) => {
  const res = await api.post("/offers", payload);
  return res.data?.data ?? null;
};

export const updateOffer = async (id, payload) => {
  const res = await api.patch(`/offers/${id}`, payload);
  return res.data?.data ?? null;
};
