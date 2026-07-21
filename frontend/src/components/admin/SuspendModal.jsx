import { useState } from "react";
import { Ban } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

/**
 * Confirm modal with a required-ish reason field for suspending an account.
 */
export default function SuspendModal({ open, userName, loading, onCancel, onConfirm }) {
  return (
    <SuspendModalBody
      key={open ? userName ?? "open" : "closed"}
      open={open}
      userName={userName}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

function SuspendModalBody({ open, userName, loading, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title="Suspend account"
      description={userName ? `Suspending ${userName}` : undefined}
      icon={Ban}
    >
      <div className="p-6">
        <label className="mb-1.5 block text-sm font-medium text-fg">
          Reason
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this account being suspended?"
          className="field w-full resize-none"
        />
        <p className="mt-1.5 text-xs text-muted">
          The account is signed out immediately and can't log in until reinstated.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            leftIcon={Ban}
            loading={loading}
            onClick={() => onConfirm(reason.trim())}
          >
            Suspend
          </Button>
        </div>
      </div>
    </Modal>
  );
}
