import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminNav, TABS } from "@/components/admin/AdminNav";

describe("AdminNav", () => {
  it("renders all defined navigation tabs", () => {
    render(<AdminNav activeTab="overview" onSelectTab={vi.fn()} />);

    for (const tab of TABS) {
      expect(
        screen.getByRole("button", { name: tab.label }),
      ).toBeInTheDocument();
    }
  });

  it("sets aria-current='page' only on the active tab", () => {
    render(<AdminNav activeTab="groups" onSelectTab={vi.fn()} />);

    const groupsButton = screen.getByRole("button", { name: "Groups" });
    const usersButton = screen.getByRole("button", { name: "Users" });

    expect(groupsButton).toHaveAttribute("aria-current", "page");
    expect(usersButton).not.toHaveAttribute("aria-current");
  });

  it("calls onSelectTab when a tab button is clicked", () => {
    const handleSelect = vi.fn();
    render(<AdminNav activeTab="overview" onSelectTab={handleSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Transactions" }));
    expect(handleSelect).toHaveBeenCalledWith("transactions");
  });

  it("applies sidebar layout classes by default", () => {
    const { container } = render(
      <AdminNav activeTab="overview" onSelectTab={vi.fn()} layout="sidebar" />,
    );

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("flex", "flex-col", "gap-1");

    const overviewButton = screen.getByRole("button", { name: "Overview" });
    expect(overviewButton).toHaveClass("text-left", "px-3", "py-2");
  });

  it("applies mobile layout classes when layout='mobile'", () => {
    const { container } = render(
      <AdminNav activeTab="overview" onSelectTab={vi.fn()} layout="mobile" />,
    );

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass(
      "flex",
      "gap-1",
      "overflow-x-auto",
      "border-b",
      "border-slate-200",
      "bg-white",
      "px-3",
      "py-2",
      "md:hidden",
    );

    const overviewButton = screen.getByRole("button", { name: "Overview" });
    expect(overviewButton).toHaveClass("whitespace-nowrap", "px-3", "py-1.5");
  });
});
