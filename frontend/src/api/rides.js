import api from "./axios";

export const fetchRides = async (params = {}) => {
  const res = await api.get("/rides", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const createRide = async (payload) => {
  const res = await api.post("/rides", payload);
  return res.data?.data ?? null;
};

export const joinRide = async (id) => {
  const res = await api.post(`/rides/${id}/join`);
  return res.data?.data ?? null;
};

export const leaveRide = async (id) => {
  const res = await api.post(`/rides/${id}/leave`);
  return res.data?.data ?? null;
};

export const deleteRide = async (id) => {
  const res = await api.delete(`/rides/${id}`);
  return res.data?.data ?? null;
};
