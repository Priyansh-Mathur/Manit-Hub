import api from "./axios";

export const fetchLeaderboard = async () => {
  const res = await api.get("/leaderboard");
  return res.data?.data ?? null;
};
