import api from "./axios";

export const registerPushToken = async (token, platform) => {
  const res = await api.post("/push/register", { token, platform });
  return res.data?.data ?? null;
};

export const unregisterPushToken = async (token) => {
  const res = await api.post("/push/unregister", { token });
  return res.data?.data ?? null;
};
