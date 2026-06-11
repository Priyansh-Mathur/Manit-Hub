import api from "./axios";

export const fetchQuestions = async (params = {}) => {
  const res = await api.get("/forum/questions", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const askQuestion = async (payload) => {
  const res = await api.post("/forum/questions", payload);
  return res.data?.data ?? null;
};

export const fetchQuestion = async (id) => {
  const res = await api.get(`/forum/questions/${id}`);
  return res.data?.data ?? null;
};

export const upvoteQuestion = async (id) => {
  const res = await api.post(`/forum/questions/${id}/upvote`);
  return res.data?.data ?? null;
};

export const deleteQuestion = async (id) => {
  const res = await api.delete(`/forum/questions/${id}`);
  return res.data?.data ?? null;
};

export const addAnswer = async (questionId, body) => {
  const res = await api.post(`/forum/questions/${questionId}/answers`, { body });
  return res.data?.data ?? null;
};

export const upvoteAnswer = async (id) => {
  const res = await api.post(`/forum/answers/${id}/upvote`);
  return res.data?.data ?? null;
};

export const acceptAnswer = async (id) => {
  const res = await api.post(`/forum/answers/${id}/accept`);
  return res.data?.data ?? null;
};

export const deleteAnswer = async (id) => {
  const res = await api.delete(`/forum/answers/${id}`);
  return res.data?.data ?? null;
};
