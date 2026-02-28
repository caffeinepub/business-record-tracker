import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart2,
  Home,
  List,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { LoginScreen } from "./components/LoginScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { Analytics } from "./pages/Analytics";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Transactions } from "./pages/Transactions";

type Tab = "home" | "transactions" | "analytics" | "settings";

const NAV_ITEMS: {
  key: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "transactions", label: "Transactions", icon: List },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAddModal, setShowAddModal] = useState(false);

  // Loading state while auth initializes
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-16 h-16 card-gradient-teal rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">₹</span>
        </div>
        <div className="space-y-2 w-40">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-3/4 rounded-full mx-auto" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!identity) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-center" />
      </>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Narrow max-width wrapper for desktop */}
      <div className="flex flex-col h-screen max-w-[480px] mx-auto w-full relative bg-background">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 h-[var(--brt-header-height)] border-b border-border bg-card z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 card-gradient-teal rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <span className="font-bold text-base text-foreground tracking-tight">
              {activeTab === "home"
                ? "Business Record Tracker"
                : activeTab === "transactions"
                  ? "Transactions"
                  : activeTab === "analytics"
                    ? "Analytics"
                    : "Settings"}
            </span>
          </div>
          {/* BRT badge */}
          <span className="text-xs font-bold text-primary bg-accent px-2.5 py-1 rounded-full">
            BRT
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <PageWrapper key="home">
                <Dashboard onAddTransaction={() => setShowAddModal(true)} />
              </PageWrapper>
            )}
            {activeTab === "transactions" && (
              <PageWrapper key="transactions">
                <Transactions onAddTransaction={() => setShowAddModal(true)} />
              </PageWrapper>
            )}
            {activeTab === "analytics" && (
              <PageWrapper key="analytics">
                <Analytics />
              </PageWrapper>
            )}
            {activeTab === "settings" && (
              <PageWrapper key="settings">
                <Settings />
              </PageWrapper>
            )}
          </AnimatePresence>
        </main>

        {/* FAB */}
        {(activeTab === "home" || activeTab === "transactions") && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="absolute bottom-[calc(var(--brt-nav-height)+16px)] right-4 w-14 h-14 card-gradient-teal rounded-full flex items-center justify-center shadow-fab z-20"
            aria-label="Add transaction"
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </motion.button>
        )}

        {/* Bottom Navigation */}
        <nav className="flex-shrink-0 h-[var(--brt-nav-height)] bg-card border-t border-border shadow-nav-up safe-bottom z-10">
          <div className="flex h-full">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon
                      className={`h-5 w-5 transition-all ${isActive ? "scale-110" : ""}`}
                    />
                    {isActive && (
                      <div className="nav-active-dot absolute -bottom-2 left-1/2 -translate-x-1/2" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium mt-1.5 ${isActive ? "text-primary" : ""}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

function PageWrapper({
  children,
  key: _key,
}: {
  children: React.ReactNode;
  key: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.18 }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}
