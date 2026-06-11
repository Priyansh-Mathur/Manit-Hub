import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { IndianRupee, Copy, Check, Smartphone, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";
import { usersApi } from "../../api/users";

const buildUpiLink = ({ upiId, name, amount, note }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name || "Seller",
    cu: "INR",
  });
  if (amount && Number(amount) > 0) params.set("am", String(Number(amount)));
  if (note) params.set("tn", note.slice(0, 50));
  return `upi://pay?${params.toString()}`;
};

export default function PayUpiModal({ open, onClose, listing }) {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const seller = listing?.seller;

  useEffect(() => {
    if (!open || !seller?._id) return;
    const load = async () => {
      setLoading(true);
      setAmount(String(listing.price ?? ""));
      try {
        const res = await usersApi.getProfile(seller._id);
        setPaymentInfo(res.data?.data?.paymentInfo || null);
      } catch (err) {
        console.error("Failed to load seller payment info", err);
        setPaymentInfo(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, seller?._id, listing?.price]);

  const upiLink = useMemo(() => {
    if (!paymentInfo?.upiId) return "";
    return buildUpiLink({
      upiId: paymentInfo.upiId,
      name: seller?.displayName,
      amount,
      note: `Manit Hub: ${listing?.title || "marketplace"}`,
    });
  }, [paymentInfo, seller?.displayName, amount, listing?.title]);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!upiLink) {
        setQrDataUrl("");
        return;
      }
      try {
        const url = await QRCode.toDataURL(upiLink, { width: 280, margin: 1 });
        if (!cancelled) setQrDataUrl(url);
      } catch (err) {
        console.error("QR generation failed", err);
      }
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [upiLink]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentInfo.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={IndianRupee}
      title="Pay via UPI"
      description={listing?.title}
    >
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !paymentInfo?.upiId && !paymentInfo?.upiQrUrl ? (
          <EmptyState
            icon={AlertCircle}
            title="No UPI set up"
            description={`${seller?.displayName || "This seller"} hasn't added a UPI ID yet — message them to arrange payment.`}
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {paymentInfo?.upiId && (
              <>
                <div className="flex items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Seller's UPI ID</p>
                    <p className="truncate font-mono text-sm font-semibold text-fg">
                      {paymentInfo.upiId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy UPI ID"
                    className="ring-focus shrink-0 rounded-lg border p-2 text-muted transition hover:text-fg"
                  >
                    {copied ? <Check size={14} className="text-success-600" /> : <Copy size={14} />}
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-fg">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="field"
                  />
                  <p className="mt-1 text-xs text-muted">
                    Pre-filled with the listing price — agree on the final price in chat first.
                  </p>
                </div>

                {qrDataUrl && (
                  <div className="flex flex-col items-center rounded-2xl border bg-white p-4">
                    <img
                      src={qrDataUrl}
                      alt={`UPI QR for ${paymentInfo.upiId}`}
                      className="h-48 w-48"
                    />
                    <p className="mt-2 text-center text-xs text-gray-500">
                      Scan with any UPI app
                    </p>
                  </div>
                )}

                <a
                  href={upiLink}
                  className="ring-focus inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-700 active:translate-y-px"
                >
                  <Smartphone className="h-4 w-4" />
                  Open UPI app & pay
                </a>
              </>
            )}

            {!paymentInfo?.upiId && paymentInfo?.upiQrUrl && (
              <div className="flex flex-col items-center rounded-2xl border bg-white p-4">
                <img
                  src={paymentInfo.upiQrUrl}
                  alt="Seller's UPI QR code"
                  className="max-h-64 w-auto"
                />
                <p className="mt-2 text-center text-xs text-gray-500">
                  Scan the seller's QR with any UPI app
                </p>
              </div>
            )}

            <p className="text-center text-[11px] leading-relaxed text-muted">
              Payments go directly to the seller — Manit Hub never holds money.
              Pay only after inspecting the item.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
