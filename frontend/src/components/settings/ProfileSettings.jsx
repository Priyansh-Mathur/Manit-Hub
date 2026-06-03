import { useEffect, useState, useRef } from "react";
import { Mail, Phone, MapPin, Save, Trash2, LogOut, User, CreditCard, Package, Heart } from "lucide-react";
import { useAuthContext } from "../../context/useAuthContext";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Segmented from "../ui/Segmented";
import EmptyState from "../ui/EmptyState";
import ConfirmModal from "../ui/ConfirmModal";
import { useToast } from "../ui/useToast";
import { cn } from "../../lib/cn";
import { fetchMyListings } from "../../api/listings";
import { usersApi } from "../../api/users";
import ListingCard from "../marketplace/ListingCard";
import {
  updatePaymentInfo,
  uploadPaymentQr,
  updateNotificationPreferences,
  updatePrivacySettings,
} from "../../api/settings";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="ring-focus flex items-center gap-3 rounded-lg"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-primary-600" : "bg-muted/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[1.375rem]" : "left-0.5"
          )}
        />
      </span>
      <span className="text-sm text-fg">{label}</span>
    </button>
  );
}

export default function ProfileSettings({ settings, onSettingsUpdate }) {
  const { user, login, logout } = useAuthContext();
  const navigate = useNavigate();
  const { show } = useToast();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState("profile");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || user?.avatar || null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    upiId: settings?.paymentInfo?.upiId || "",
    upiQrUrl: settings?.paymentInfo?.upiQrUrl || "",
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    messages: settings?.notificationPreferences?.messages ?? true,
    studyGroups: settings?.notificationPreferences?.studyGroups ?? true,
    marketplace: settings?.notificationPreferences?.marketplace ?? true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: settings?.privacySettings?.profileVisibility || "everyone",
    showOnlineStatus: settings?.privacySettings?.showOnlineStatus ?? true,
    allowDirectMessages: settings?.privacySettings?.allowDirectMessages ?? true,
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    if (!settings) return;
    setPaymentInfo({
      upiId: settings?.paymentInfo?.upiId || "",
      upiQrUrl: settings?.paymentInfo?.upiQrUrl || "",
    });
    setNotificationPreferences({
      messages: settings?.notificationPreferences?.messages ?? true,
      studyGroups: settings?.notificationPreferences?.studyGroups ?? true,
      marketplace: settings?.notificationPreferences?.marketplace ?? true,
    });
    setPrivacySettings({
      profileVisibility: settings?.privacySettings?.profileVisibility || "everyone",
      showOnlineStatus: settings?.privacySettings?.showOnlineStatus ?? true,
      allowDirectMessages: settings?.privacySettings?.allowDirectMessages ?? true,
    });
    if (user?.avatarUrl || user?.avatar) {
      setAvatarUrl(user.avatarUrl || user.avatar);
    }
  }, [settings, user?.avatarUrl, user?.avatar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await usersApi.updateProfile(formData);
      const savedUser = response?.data?.data?.user || response?.data?.user;
      if (savedUser) {
        login({ user: savedUser, token: localStorage.getItem("token") });
        try {
          await updateNotificationPreferences(notificationPreferences);
        } catch (err) {
          console.error("Failed to update notification preferences", err);
        }
        try {
          await updatePrivacySettings(privacySettings);
        } catch (err) {
          console.error("Failed to update privacy settings", err);
        }
        setFormData((prev) => ({
          ...prev,
          displayName: savedUser.displayName || prev.displayName,
          email: savedUser.email || prev.email,
          phone: savedUser.phone || prev.phone,
          location: savedUser.location || prev.location,
          bio: savedUser.bio || prev.bio,
        }));
        show("Profile updated", "success");
      } else {
        show("Profile saved, but the response was invalid", "error");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      show("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await usersApi.deleteMe();
      show("Account deleted", "success");
      logout();
      navigate("/auth");
    } catch (error) {
      console.error("Failed to delete account:", error);
      show("Failed to delete account", "error");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      show("File size must be less than 5MB", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      show("Please upload an image file", "error");
      return;
    }
    try {
      setAvatarLoading(true);
      const response = await usersApi.uploadAvatar(file);
      const newAvatarUrl = response?.data?.data?.avatarUrl || response?.data?.avatarUrl;
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
        const updatedUser = { ...user, avatarUrl: newAvatarUrl, avatar: newAvatarUrl };
        login({ user: updatedUser, token: localStorage.getItem("token") });
        show("Profile picture updated", "success");
      } else {
        show("Avatar uploaded but response was invalid", "error");
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      show("Failed to upload profile picture", "error");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePaymentSave = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      if (qrFile) {
        const uploadRes = await uploadPaymentQr(qrFile);
        if (uploadRes.success) {
          setPaymentInfo((prev) => ({ ...prev, upiQrUrl: uploadRes.data.upiQrUrl }));
          if (onSettingsUpdate) {
            onSettingsUpdate((prev) => ({
              ...prev,
              paymentInfo: { ...prev.paymentInfo, upiQrUrl: uploadRes.data.upiQrUrl },
            }));
          }
        }
        setQrFile(null);
      }
      const response = await updatePaymentInfo(paymentInfo);
      if (response.success) {
        show("Payment info updated", "success");
        if (onSettingsUpdate) {
          onSettingsUpdate((prev) => ({ ...prev, paymentInfo: response.data }));
        }
      }
    } catch (error) {
      console.error("Failed to update payment info:", error);
      show("Failed to update payment info", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    const loadMarketplaceData = async () => {
      try {
        setLoadingListings(true);
        const [myListingsRes, wishlistRes] = await Promise.all([
          fetchMyListings(),
          usersApi.getSavedListings(),
        ]);
        setMyListings(Array.isArray(myListingsRes) ? myListingsRes : []);
        setWishlist(wishlistRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load listings:", error);
      } finally {
        setLoadingListings(false);
      }
    };
    loadMarketplaceData();
  }, []);

  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    { value: "payments", label: "Payments", icon: CreditCard },
    { value: "listings", label: "My Listings", icon: Package, count: myListings.length },
    { value: "wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Segmented options={tabs} value={tab} onChange={setTab} />
      </div>

      {tab === "profile" && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={avatarUrl} name={formData.displayName || "U"} size="xl" ring />
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={avatarLoading}
                >
                  {avatarLoading ? "Uploading…" : "Change photo"}
                </Button>
                <p className="mt-1.5 text-xs text-muted">JPG, PNG up to 5MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Display name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="field pl-11"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="field pl-11"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="City, State"
                    className="field pl-11"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell other students about yourself…"
                rows="3"
                className="field resize-none"
              />
            </div>

            <div className="rounded-2xl border p-4">
              <h3 className="mb-3 text-sm font-semibold text-fg">
                Notification preferences
              </h3>
              <div className="flex flex-wrap gap-6">
                <Toggle
                  label="Messages"
                  checked={notificationPreferences.messages}
                  onChange={(v) =>
                    setNotificationPreferences({ ...notificationPreferences, messages: v })
                  }
                />
                <Toggle
                  label="Study groups"
                  checked={notificationPreferences.studyGroups}
                  onChange={(v) =>
                    setNotificationPreferences({ ...notificationPreferences, studyGroups: v })
                  }
                />
                <Toggle
                  label="Marketplace"
                  checked={notificationPreferences.marketplace}
                  onChange={(v) =>
                    setNotificationPreferences({ ...notificationPreferences, marketplace: v })
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <h3 className="mb-3 text-sm font-semibold text-fg">Privacy</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-fg">
                    Profile visibility
                  </label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        profileVisibility: e.target.value,
                      })
                    }
                    className="field"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="students">Students</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Toggle
                    label="Show online status"
                    checked={privacySettings.showOnlineStatus}
                    onChange={(v) =>
                      setPrivacySettings({ ...privacySettings, showOnlineStatus: v })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Toggle
                    label="Allow direct messages"
                    checked={privacySettings.allowDirectMessages}
                    onChange={(v) =>
                      setPrivacySettings({ ...privacySettings, allowDirectMessages: v })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={LogOut}
                  onClick={handleLogout}
                >
                  Log out
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={Trash2}
                  className="text-danger-600 hover:bg-danger-500/10"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete account
                </Button>
              </div>
              <Button type="submit" leftIcon={Save} loading={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tab === "payments" && (
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-fg">
            <CreditCard size={18} className="text-primary-600" />
            Payment details
          </h3>
          <form onSubmit={handlePaymentSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg">UPI ID</label>
              <input
                type="text"
                value={paymentInfo.upiId}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, upiId: e.target.value })}
                className="field"
                placeholder="yourname@upi"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg">
                UPI QR code
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="field file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700"
              />
              {paymentInfo.upiQrUrl && (
                <img
                  src={paymentInfo.upiQrUrl}
                  alt="UPI QR"
                  className="mt-3 h-32 w-32 rounded-xl border object-cover"
                />
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={savingPayment}>
                {savingPayment ? "Saving…" : "Save payment info"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tab === "listings" && (
        <Card>
          <h3 className="mb-4 font-display text-lg font-bold text-fg">My listings</h3>
          {loadingListings ? (
            <p className="text-sm text-muted">Loading listings…</p>
          ) : myListings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No active listings"
              description="Items you list on the marketplace will appear here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myListings.map((listing) => (
                <ListingCard key={listing._id} item={listing} />
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "wishlist" && (
        <Card>
          <h3 className="mb-4 font-display text-lg font-bold text-fg">Wishlist</h3>
          {loadingListings ? (
            <p className="text-sm text-muted">Loading wishlist…</p>
          ) : wishlist.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save items from the marketplace to find them here later."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {wishlist.map((listing) => (
                <ListingCard key={listing._id} item={listing} />
              ))}
            </div>
          )}
        </Card>
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Delete account?"
        description="This permanently deletes your account and removes your listings."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDeleteAccount();
        }}
      />
    </div>
  );
}
