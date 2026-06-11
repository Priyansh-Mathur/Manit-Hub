import { useLocation, useNavigate } from "react-router-dom";
import Segmented from "../ui/Segmented";
import { hubs } from "./navConfig";

/** Sibling-page switcher rendered at the top of every page in a hub group. */
export default function HubTabs({ hub }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const def = hubs[hub];
  if (!def) return null;

  const active =
    def.tabs.find(
      (tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`)
    )?.to ?? def.tabs[0].to;

  return (
    <Segmented
      options={def.tabs.map((tab) => ({ value: tab.to, label: tab.label }))}
      value={active}
      onChange={(to) => to !== active && navigate(to)}
    />
  );
}
