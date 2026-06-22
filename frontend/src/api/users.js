import api from "./axios";
import { resizeImage } from "../lib/resizeImage";

export const usersApi = {
  getProfile: (userId) => api.get(`/users/${userId}/profile`),
  updateProfile: (profile) => api.put("/users/me", profile),
  searchUsers: (q) => api.get("/users/search", { params: { q } }),
  checkHandle: (handle) =>
    api.get("/users/handle-available", { params: { handle } }),
  getSavedListings: () => api.get("/users/me/saved-listings"),
  toggleSavedListing: (listingId) => api.post(`/users/saved-listings/${listingId}`),
  deleteMe: () => api.delete("/users/me"),
  uploadAvatar: async (file) => {
    const resized = await resizeImage(file, 256);
    const formData = new FormData();
    formData.append("avatar", resized, resized.name || "avatar.jpg");
    return api.put("/users/avatar", formData);
  },
};
