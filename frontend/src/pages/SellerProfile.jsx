import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, QrCode, Store } from "lucide-react";
import { usersApi } from "../api/users";
import ListingCard from "../components/marketplace/ListingCard";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await usersApi.getProfile(id);
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load seller profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner size={28} />
        <p className="text-sm text-muted">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted">Seller not found.</p>
        <Button leftIcon={ArrowLeft} onClick={() => navigate("/marketplace")}>
          Back to marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={ArrowLeft}
        onClick={() => navigate("/marketplace")}
      >
        Back to marketplace
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar
              src={profile.user.avatarUrl || profile.user.avatar}
              name={profile.user.displayName}
              size="xl"
              ring
            />
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
                {profile.user.displayName}
              </h1>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
                <Package size={15} className="text-primary-600" />
                {profile.stats.totalListings} listing
                {profile.stats.totalListings === 1 ? "" : "s"} on the marketplace
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
            <QrCode size={16} className="text-primary-600" />
            Payment info
          </h2>
          {profile.paymentInfo?.upiId && (
            <p className="text-sm text-muted">
              UPI ID:{" "}
              <span className="font-medium text-fg">
                {profile.paymentInfo.upiId}
              </span>
            </p>
          )}
          {profile.paymentInfo?.upiQrUrl && (
            <img
              src={profile.paymentInfo.upiQrUrl}
              alt="UPI QR"
              className="mt-3 h-40 w-40 rounded-xl border object-cover"
            />
          )}
          {!profile.paymentInfo?.upiId && !profile.paymentInfo?.upiQrUrl && (
            <p className="text-sm text-muted">No payment info shared.</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-fg">Listings</h2>
        {profile.listings.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No active listings"
            description="This seller has no items listed right now."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profile.listings.map((listing) => (
              <ListingCard key={listing._id} item={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
