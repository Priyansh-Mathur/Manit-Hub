import { useCallback, useEffect, useState } from "react";
import { HandCoins, Check, X, RefreshCcw, Undo2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import { PLACEHOLDER_LISTING } from "../lib/images";
import HubTabs from "../components/nav/HubTabs";
import { fetchOffers, updateOffer } from "../api/offers";
import { useToast } from "../components/ui/useToast";

const STATUS_TONES = {
  pending: "warning",
  countered: "primary",
  accepted: "success",
  declined: "danger",
  withdrawn: "neutral",
};

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function CounterModal({ open, offer, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setAmount(String(offer?.amount ?? ""));
  }, [open, offer?.amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(Number(amount));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={RefreshCcw}
      title="Counter the offer"
      description={offer ? `Buyer offered ${inr(offer.amount)}` : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Your counter (₹)
          </label>
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field"
          />
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Send counter-offer
        </Button>
      </form>
    </Modal>
  );
}

export default function Offers() {
  const [role, setRole] = useState("seller");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterFor, setCounterFor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOffers(await fetchOffers({ role }));
    } catch (err) {
      console.error("Failed to fetch offers", err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (offer, action, counterAmount) => {
    setBusyId(offer._id);
    try {
      const updated = await updateOffer(offer._id, { action, counterAmount });
      setOffers((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
      show("Offer updated", "success");
    } catch (err) {
      console.error("Offer action failed", err);
      show(err?.response?.data?.message || "Could not update offer", "error");
    } finally {
      setBusyId(null);
    }
  };

  const isSellerView = role === "seller";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HubTabs hub="market" />
      <PageHeader
        eyebrow="Marketplace"
        title="Offers"
        subtitle="Negotiate prices — accept, counter or decline without leaving the app."
        icon={HandCoins}
        actions={
          <Segmented
            options={[
              { value: "seller", label: "Received" },
              { value: "buyer", label: "Made" },
            ]}
            value={role}
            onChange={setRole}
          />
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title={isSellerView ? "No offers received" : "No offers made"}
          description={
            isSellerView
              ? "Offers buyers make on your listings will appear here."
              : "Spot something on the marketplace? Make the first move."
          }
        />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const other = isSellerView ? offer.buyer : offer.seller;
            const active = ["pending", "countered"].includes(offer.status);
            const busy = busyId === offer._id;
            return (
              <div
                key={offer._id}
                className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card"
              >
                <img
                  src={offer.listing?.images?.[0] || PLACEHOLDER_LISTING}
                  alt={offer.listing?.title}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_LISTING;
                  }}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-semibold text-fg">
                      {offer.listing?.title || "Listing removed"}
                    </h3>
                    <Badge tone={STATUS_TONES[offer.status]}>
                      {offer.status}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    Listed {inr(offer.listing?.price ?? 0)} · offered{" "}
                    <span className="font-bold text-fg">{inr(offer.amount)}</span>
                    {offer.status === "countered" && offer.counterAmount && (
                      <>
                        {" "}· countered{" "}
                        <span className="font-bold text-primary-600">
                          {inr(offer.counterAmount)}
                        </span>
                      </>
                    )}
                  </p>

                  {offer.message && (
                    <p className="mt-1 text-xs italic text-muted line-clamp-1">
                      “{offer.message}”
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <Avatar
                      src={other?.avatarUrl}
                      name={other?.displayName || "Student"}
                      size="xs"
                    />
                    <span className="font-medium text-fg">
                      {other?.displayName}
                    </span>
                  </div>

                  {active && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {isSellerView && offer.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            leftIcon={Check}
                            disabled={busy}
                            onClick={() => act(offer, "accept")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={RefreshCcw}
                            disabled={busy}
                            onClick={() => setCounterFor(offer)}
                          >
                            Counter
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            leftIcon={X}
                            disabled={busy}
                            onClick={() => act(offer, "decline")}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {isSellerView && offer.status === "countered" && (
                        <p className="text-xs text-muted">
                          Waiting for the buyer's response to your counter…
                        </p>
                      )}
                      {!isSellerView && offer.status === "pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={Undo2}
                          disabled={busy}
                          onClick={() => act(offer, "withdraw")}
                        >
                          Withdraw
                        </Button>
                      )}
                      {!isSellerView && offer.status === "countered" && (
                        <>
                          <Button
                            size="sm"
                            leftIcon={Check}
                            disabled={busy}
                            onClick={() => act(offer, "accept-counter")}
                          >
                            Accept {inr(offer.counterAmount)}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            leftIcon={X}
                            disabled={busy}
                            onClick={() => act(offer, "decline-counter")}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CounterModal
        open={!!counterFor}
        offer={counterFor}
        onClose={() => setCounterFor(null)}
        onSubmit={(amount) => act(counterFor, "counter", amount)}
      />
    </div>
  );
}
