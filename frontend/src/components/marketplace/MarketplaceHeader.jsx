import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import ListItemModal from "./ListItemModal";
import { createListing, uploadListingImages } from "../../api/listings";

export default function MarketplaceHeader({ onListingCreated }) {
  const [showModal, setShowModal] = useState(false);

  const handleCreateListing = async ({ listingData, files }) => {
    try {
      const listing = await createListing(listingData);
      if (files && files.length > 0 && listing?._id) {
        try {
          await uploadListingImages(listing._id, files);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }
      if (onListingCreated) onListingCreated();
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="MANIT Marketplace"
        title="Marketplace"
        subtitle="Buy, sell & trade with fellow students."
        actions={
          <Button leftIcon={Plus} onClick={() => setShowModal(true)}>
            List an item
          </Button>
        }
      />

      <ListItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateListing}
      />
    </>
  );
}
