import api from "./axios";
import { resizeImages } from "../lib/resizeImage";

export const fetchListings = async (params = {}) => {
  const res = await api.get("/listings", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? null,
  };
};

export const createListing = async (payload) => {
  const res = await api.post("/listings", payload);
  return res.data?.data ?? [];
};

export const fetchMyListings = async () => {
  const res = await api.get("/listings/me");
  return res.data?.data ?? [];
};

export const updateListingStatus = async (listingId, status) => {
  const res = await api.patch(`/listings/${listingId}/status`, { status });
  return res.data?.data ?? null;
};

export const uploadListingImages = async (listingId, files) => {
  const resized = await resizeImages(files, 1000);
  const formData = new FormData();
  resized.forEach((file) => formData.append("images", file, file.name || "image.jpg"));
  const res = await api.post(`/listings/${listingId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data ?? null;
};

export const updateListing = async (listingId, payload) => {
  const res = await api.put(`/listings/${listingId}`, payload);
  return res.data?.data ?? null;
};

export const deleteListing = async (listingId) => {
  const res = await api.delete(`/listings/${listingId}`);
  return res.data?.data ?? null;
};
