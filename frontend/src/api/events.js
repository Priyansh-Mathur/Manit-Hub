import api from "./axios";

export const fetchEvents = async (params = {}) => {
  const res = await api.get("/events", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const createEvent = async (payload) => {
  const res = await api.post("/events", payload);
  return res.data?.data ?? null;
};

export const toggleRsvp = async (id) => {
  const res = await api.post(`/events/${id}/rsvp`);
  return res.data?.data ?? null;
};

export const deleteEvent = async (id) => {
  const res = await api.delete(`/events/${id}`);
  return res.data?.data ?? null;
};
