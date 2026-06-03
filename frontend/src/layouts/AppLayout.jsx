import { useState } from "react";
import { Outlet } from "react-router-dom";
import { CommandProvider } from "../components/command/CommandPalette";
import SideNav from "../components/nav/SideNav";
import TopBar from "../components/nav/TopBar";
import MobileDrawer from "../components/nav/MobileDrawer";
import BottomNav from "../components/nav/BottomNav";

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <CommandProvider>
      <div className="min-h-screen bg-bg text-fg">
        <div className="mx-auto flex w-full max-w-[1600px]">
          <div className="hidden lg:block">
            <SideNav />
          </div>
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <TopBar onMenu={() => setDrawerOpen(true)} />
            <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
              <div className="mx-auto w-full max-w-6xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <BottomNav />
      </div>
    </CommandProvider>
  );
}
