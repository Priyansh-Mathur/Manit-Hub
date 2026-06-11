import api from "./axios";

export const fetchTimetable = async () => {
  const res = await api.get("/timetable");
  return res.data?.data ?? [];
};

export const createTimetableEntry = async (payload) => {
  const res = await api.post("/timetable", payload);
  return res.data?.data ?? null;
};

export const updateTimetableEntry = async (id, payload) => {
  const res = await api.put(`/timetable/${id}`, payload);
  return res.data?.data ?? null;
};

export const deleteTimetableEntry = async (id) => {
  const res = await api.delete(`/timetable/${id}`);
  return res.data?.data ?? null;
};
