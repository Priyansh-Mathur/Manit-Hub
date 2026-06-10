import api from "./axios";

export const fetchAttendance = async () => {
  const res = await api.get("/attendance");
  return res.data?.data ?? [];
};

export const addAttendanceSubject = async (payload) => {
  const res = await api.post("/attendance", payload);
  return res.data?.data ?? null;
};

export const updateAttendanceSubject = async (id, payload) => {
  const res = await api.patch(`/attendance/${id}`, payload);
  return res.data?.data ?? null;
};

export const deleteAttendanceSubject = async (id) => {
  const res = await api.delete(`/attendance/${id}`);
  return res.data?.data ?? null;
};
