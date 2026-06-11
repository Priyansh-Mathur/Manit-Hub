import { useState } from "react";
import { Heart, MessageCircle, CheckCircle, Pencil, Trash2, IndianRupee, HandCoins, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { messagesApi } from "../../api/messages";
import {
  updateListingStatus,
  updateListing,
  deleteListing,
  uploadListingImages,
} from "../../api/listings";
import { usersApi } from "../../api/users";
import { useAuthContext } from "../../context/useAuthContext";
import { useToast } from "../ui/useToast";
import { PLACEHOLDER_LISTING } from "../../lib/images";
import { cn } from "../../lib/cn";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import ListItemModal from "./ListItemModal";
import ConfirmModal from "../ui/ConfirmModal";
import PayUpiModal from "./PayUpiModal";
import MakeOfferModal from "./MakeOfferModal";
import ReportModal from "../moderation/ReportModal";

const conditionTone = {
  new: "success",
  "like-new": "primary",
  good: "gold",
  fair: "warning",
};

export default function ListingCard({ item }) {
  const { user, login } = useAuthContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState(item.status || "available");
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { show } = useToast();
  const isSeller = user && item.seller?._id === user._id;
  const isSaved = (user?.savedListings || [])
    .map(String)
    .includes(String(item._id));

  const handleStartConversation = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (item.seller._id === user._id) return;

    try {
      await messagesApi.createConversation({
        listingId: item._id,
        listingTitle: item.title,
        participantId: item.seller._id,
      });
      navigate("/messages");
    } catch (error) {
      console.error("Error creating conversation:", error);
      show("Could not start conversation", "error");
    }
  };

  const handleMarkSold = async () => {
    try {
      const updated = await updateListingStatus(item._id, "sold");
      if (updated?.status) setStatus(updated.status);
      show("Marked as sold", "success");
    } catch (error) {
      console.error("Error updating listing status:", error);
      show("Could not update status", "error");
    }
  };

  const handleToggleSaved = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      const wasSaved = isSaved;
      const response = await usersApi.toggleSavedListing(item._id);
      const saved = response.data?.data || [];
      login({
        user: { ...user, savedListings: saved.map(String) },
        token: localStorage.getItem("token"),
      });
      show(wasSaved ? "Removed from wishlist" : "Saved to wishlist", "success");
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      show("Wishlist update failed", "error");
    }
  };

  const handleEditListing = async ({ listingData, files }) => {
    const updated = await updateListing(item._id, listingData);
    if (files && files.length > 0) {
      try {
        await uploadListingImages(item._id, files);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
    return updated;
  };

  const handleDeleteListing = async () => {
    try {
      await deleteListing(item._id);
      show("Listing deleted", "success");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting listing:", error);
      show("Failed to delete listing", "error");
    }
  };

  const formatPrice = (value) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  const sold = status === "sold";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/10">
        <img
          src={item.images?.[0] || PLACEHOLDER_LISTING}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_LISTING;
          }}
          className={cn(
            "h-full w-full object-cover transition duration-500 group-hover:scale-105",
            sold && "opacity-70"
          )}
        />

        <button
          type="button"
          onClick={handleToggleSaved}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className="ring-focus absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-fg shadow-sm backdrop-blur transition hover:scale-105"
        >
          <Heart
            size={16}
            className={isSaved ? "fill-accent-600 text-accent-600" : "text-muted"}
          />
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {item.condition && (
            <Badge tone={conditionTone[item.condition] || "neutral"}>
              {item.condition}
            </Badge>
          )}
          {sold && <Badge tone="danger">Sold</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-fg line-clamp-2">
            {item.title}
          </h3>
          <p className="shrink-0 font-display text-lg font-extrabold tabular-nums text-primary-600">
            {formatPrice(item.price)}
          </p>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-muted">{item.category}</p>
          {!isSeller && user && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              aria-label="Report listing"
              title="Report listing"
              className="ring-focus rounded-lg p-1 text-muted/60 transition hover:text-warning-600"
            >
              <Flag size={13} />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <button
            type="button"
            onClick={() => item.seller?._id && navigate(`/sellers/${item.seller._id}`)}
            className="ring-focus flex min-w-0 items-center gap-2 rounded-lg text-left"
          >
            <Avatar
              src={item.seller?.avatarUrl || item.seller?.avatar}
              name={item.seller?.displayName || "Seller"}
              size="xs"
            />
            <span className="truncate text-sm font-medium text-fg hover:text-primary-600">
              {item.seller?.displayName || "Unknown seller"}
            </span>
          </button>

          {!isSeller && user && !sold && (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                aria-label="Make an offer"
                title="Make an offer"
                className="ring-focus inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-surface text-muted transition hover:border-gold-500/40 hover:text-gold-600"
              >
                <HandCoins size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                aria-label="Pay via UPI"
                title="Pay via UPI"
                className="ring-focus inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-surface text-muted transition hover:border-success-500/40 hover:text-success-600"
              >
                <IndianRupee size={16} />
              </button>
              <button
                type="button"
                onClick={handleStartConversation}
                aria-label="Message seller"
                className="ring-focus inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-surface text-muted transition hover:border-primary-500/40 hover:text-primary-600"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          )}
        </div>

        {isSeller && !sold && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="ring-focus inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-surface px-2 py-1.5 text-xs font-medium text-muted transition hover:text-fg"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="ring-focus inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-danger-500/30 px-2 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-500/10"
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              type="button"
              onClick={handleMarkSold}
              className="ring-focus inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-600/10 px-2 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-600/20 dark:text-primary-200"
            >
              <CheckCircle size={13} /> Sold
            </button>
          </div>
        )}
      </div>

      <ListItemModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={handleEditListing}
        initialData={item}
        submitLabel="Save changes"
      />

      <PayUpiModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        listing={item}
      />

      <MakeOfferModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        listing={item}
      />

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="listing"
        targetId={item._id}
        title={item.title}
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Delete listing?"
        description="This will remove the listing from the marketplace permanently."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDeleteListing();
        }}
      />
    </div>
  );
}
