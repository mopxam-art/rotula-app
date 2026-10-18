"use client";

export type TabId =
  | "overview"
  | "users"
  | "groups"
  | "transactions"
  | "contracts"
  | "activity";

export interface TabItem {
  id: TabId;
  label: string;
}

export const TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "groups", label: "Groups" },
  { id: "transactions", label: "Transactions" },
  { id: "contracts", label: "Contracts" },
  { id: "activity", label: "Activity" },
];

export interface AdminNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  layout?: "sidebar" | "mobile";
  className?: string;
}

/** Single unified navigation for both desktop sidebar and mobile tab bar. */
export function AdminNav({
  activeTab,
  onSelectTab,
  layout = "sidebar",
  className,
}: AdminNavProps) {
  const isMobile = layout === "mobile";

  const containerClass =
    className ??
    (isMobile
      ? "flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden"
      : "flex flex-col gap-1");

  const buttonLayoutClass = isMobile
    ? "whitespace-nowrap px-3 py-1.5"
    : "text-left px-3 py-2";

  return (
    <nav className={containerClass}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg text-sm font-medium transition-colors ${buttonLayoutClass} ${
              isActive
                ? "bg-[#006c49]/10 text-[#006c49]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
