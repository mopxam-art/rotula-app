import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "./Sidebar";

const mockUsePathname = vi.fn<() => string | null>();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const EXISTING_ROUTES = new Set([
  "/dashboard",
  "/groups",
  "/payments",
  "/profile",
]);

describe("Sidebar (#236)", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("points the Savings item at the existing /groups route and never at /savings", () => {
    render(<Sidebar />);
    const savingsLink = screen.getByRole("link", { name: /^Savings$/i });
    expect(savingsLink).toHaveAttribute("href", "/groups");
    expect(savingsLink).not.toHaveAttribute("href", "/savings");
  });

  it("ensures every primary navigation item resolves to an existing dashboard route", () => {
    render(<Sidebar />);
    const navItems = ["Home", "Savings", "Groups", "Payments", "Settings"];
    for (const name of navItems) {
      const link = screen.getByRole("link", {
        name: new RegExp(`^${name}$`, "i"),
      });
      const href = link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(EXISTING_ROUTES.has(href!)).toBe(true);
    }
  });

  it("marks Savings as active when navigating to /groups or nested group routes", () => {
    mockUsePathname.mockReturnValue("/groups");
    const { rerender } = render(<Sidebar />);

    const savingsLink = screen.getByRole("link", { name: /^Savings$/i });
    const homeLink = screen.getByRole("link", { name: /^Home$/i });
    expect(savingsLink).toHaveClass(
      "bg-[#5fe3a1]",
      "text-gray-900",
      "font-semibold",
    );
    expect(homeLink).toHaveClass("text-gray-600");
    expect(homeLink).not.toHaveClass("bg-[#5fe3a1]");

    mockUsePathname.mockReturnValue("/groups/circle-1");
    rerender(<Sidebar />);
    expect(screen.getByRole("link", { name: /^Savings$/i })).toHaveClass(
      "bg-[#5fe3a1]",
    );
  });

  it("preserves active-state behavior for Home, Groups, Payments, and Settings", () => {
    const cases: Array<{ path: string; active: string[]; inactive: string[] }> =
      [
        {
          path: "/dashboard",
          active: ["Home"],
          inactive: ["Savings", "Groups", "Payments", "Settings"],
        },
        {
          path: "/groups",
          active: ["Savings", "Groups"],
          inactive: ["Home", "Payments", "Settings"],
        },
        {
          path: "/payments/send",
          active: ["Payments"],
          inactive: ["Home", "Savings", "Groups", "Settings"],
        },
        {
          path: "/profile",
          active: ["Settings"],
          inactive: ["Home", "Savings", "Groups", "Payments"],
        },
      ];

    const { rerender } = render(<Sidebar />);
    for (const { path, active, inactive } of cases) {
      mockUsePathname.mockReturnValue(path);
      rerender(<Sidebar />);

      for (const name of active) {
        expect(
          screen.getByRole("link", { name: new RegExp(`^${name}$`, "i") }),
        ).toHaveClass("bg-[#5fe3a1]");
      }
      for (const name of inactive) {
        expect(
          screen.getByRole("link", { name: new RegExp(`^${name}$`, "i") }),
        ).not.toHaveClass("bg-[#5fe3a1]");
      }
    }
  });

  it("closes the mobile drawer when clicking the Savings link", () => {
    render(<Sidebar />);
    const toggleBtn = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    const aside = screen.getByRole("complementary");

    expect(aside).toHaveClass("-translate-x-full");
    fireEvent.click(toggleBtn);
    expect(aside).toHaveClass("translate-x-0");

    fireEvent.click(screen.getByRole("link", { name: /^Savings$/i }));
    expect(aside).toHaveClass("-translate-x-full");
  });
});
