import api from "./axios";

export const fetchAcademicRecords = async () => {
  const res = await api.get("/academic-records");
  return res.data?.data ?? [];
};

export const saveSemester = async (semester, subjects) => {
  const res = await api.put(`/academic-records/${semester}`, { subjects });
  return res.data?.data ?? null;
};

export const deleteSemester = async (semester) => {
  const res = await api.delete(`/academic-records/${semester}`);
  return res.data?.data ?? null;
};
