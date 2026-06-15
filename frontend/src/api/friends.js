import api from "./axios";

export const friendsApi = {
  list: () => api.get("/friends"),
  requests: () => api.get("/friends/requests"),
  send: (userId) => api.post(`/friends/requests/${userId}`),
  accept: (userId) => api.patch(`/friends/requests/${userId}/accept`),
  // Decline an incoming request OR cancel an outgoing one.
  remove: (userId) => api.delete(`/friends/requests/${userId}`),
  unfriend: (userId) => api.delete(`/friends/${userId}`),
  // A user's friends list for their profile page (privacy-aware).
  listOf: (userId) => api.get(`/users/${userId}/friends`),
  // Start (or reuse) a direct friend conversation — Phase 4.
  startChat: (userId) =>
    api.post("/conversations", {
      participantId: userId,
      contextType: "friend",
    }),
};
