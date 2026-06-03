import { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import ProfileSettings from "../components/settings/ProfileSettings";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { fetchUserSettings } from "../api/settings";

export default function Settings() {
  const [settings, setSettings] = useState({
    notificationPreferences: { messages: true, studyGroups: true, marketplace: true },
    privacySettings: {
      profileVisibility: "everyone",
      showOnlineStatus: true,
      allowDirectMessages: true,
    },
    paymentInfo: { upiId: "", upiQrUrl: "" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 8000);
    const run = async () => {
      try {
        await loadSettings();
      } finally {
        clearTimeout(timeoutId);
      }
    };
    run();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetchUserSettings();
      if (response.success) setSettings(response.data);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        icon={SettingsIcon}
        subtitle="Manage your profile, payments and preferences."
      />
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <ProfileSettings settings={settings} onSettingsUpdate={setSettings} />
      )}
    </div>
  );
}
