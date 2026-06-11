import { useEffect, useState } from "react";
import { HandCoins, X, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { makeOffer } from "../../api/offers";
import { useToast } from "../ui/useToast";

export default function MakeOfferModal({ open, onClose, listing }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  useEffect(() => {
    if (open) {
      setAmount(String(listing?.price ?? ""));
      setMessage("");
      setError("");
    }
  }, [open, listing?.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await makeOffer({
        listingId: listing._id,
        amount: Number(amount),
        message,
      });
      show("Offer sent to the seller", "success");
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={HandCoins}
      title="Make an offer"
      description={listing?.title}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="flex items-center justify-between rounded-xl border bg-surface px-3.5 py-2.5 text-sm">
          <span className="text-muted">Listed price</span>
          <span className="font-display font-bold text-fg">
            ₹{Number(listing?.price ?? 0).toLocaleString("en-IN")}
          </span>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Your offer (₹) <span className="text-accent-600">*</span>
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Can pick up today if you're around hostel 5"
            rows="2"
            maxLength={300}
            className="field resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-sm text-danger-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            leftIcon={X}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            Send offer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
