import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Sidebar } from "../../components/layout/Sidebar/Sidebar";

let currentPathname = "/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("Sidebar Accessibility & Keyboard Reachability (5D Matrix)", () => {
  beforeEach(() => {
    currentPathname = "/dashboard";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Dimension 1: Boundary & Clamping
  // =========================================================================
  describe("Dimension 1: Boundary & Clamping", () => {
    it("1.1 starts in closed state on mobile with inert, aria-hidden and tabIndex=-1", () => {
      render(<Sidebar isMobile={true} />);
      const aside = screen.getByRole("complementary", { hidden: true });
      expect(aside).toHaveAttribute("aria-hidden", "true");
      expect(aside).toHaveAttribute("inert");

      const links = aside.querySelectorAll("a");
      expect(links.length).toBe(6);
      links.forEach((link) => {
        expect(link).toHaveAttribute("tabindex", "-1");
      });
    });

    it("1.2 starts with toggle button reporting aria-expanded=false and open label", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveAttribute("aria-controls", "mobile-sidebar");
    });

    it("1.3 flips aria-expanded=true and close label on toggle click", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(toggle).toHaveAttribute("aria-label", "Toggle navigation");
    });

    it("1.4 removes inert and aria-hidden from drawer when opened", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      expect(aside).not.toHaveAttribute("aria-hidden");
      expect(aside).not.toHaveAttribute("inert");
    });

    it("1.5 removes tabIndex=-1 from all navigation links when opened", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      const links = aside.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).not.toHaveAttribute("tabindex");
      });
    });

    it("1.6 restores inert and aria-expanded=false on second toggle click", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      const aside = screen.getByRole("complementary", { hidden: true });
      expect(aside).toHaveAttribute("inert");
      expect(aside).toHaveAttribute("aria-hidden", "true");
    });

    it("1.7 restores tabIndex=-1 on all links when closed again", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary", { hidden: true });
      const links = aside.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).toHaveAttribute("tabindex", "-1");
      });
    });

    const pathnames = [
      { path: "/", activeIndices: [] as number[] },
      { path: "/dashboard", activeIndices: [0] },
      { path: "/dashboard/metrics", activeIndices: [0] },
      { path: "/savings", activeIndices: [] as number[] },
      { path: "/savings/pools", activeIndices: [] as number[] },
      { path: "/groups", activeIndices: [1, 2] },
      { path: "/groups/circle-1", activeIndices: [1, 2] },
      { path: "/payments", activeIndices: [3] },
      { path: "/profile", activeIndices: [4] },
      { path: "/unknown-route", activeIndices: [] as number[] },
    ];

    pathnames.forEach(({ path, activeIndices }, idx) => {
      it(`1.8.${idx + 1} correctly highlights active item for pathname "${path}"`, () => {
        currentPathname = path;
        render(<Sidebar isMobile={true} />);
        const aside = screen.getByRole("complementary", { hidden: true });
        const navLinks = Array.from(aside.querySelectorAll("nav a"));

        navLinks.forEach((link, linkIdx) => {
          if (activeIndices.includes(linkIdx)) {
            expect(link.className).toContain("bg-[#5fe3a1]");
            expect(link.className).toContain("font-semibold");
          } else {
            expect(link.className).toContain("text-gray-600");
          }
        });
      });
    });

    [1, 2, 3, 4, 10].forEach((toggleCount, idx) => {
      it(`1.9.${idx + 1} handles rapid toggle cycle count = ${toggleCount}`, () => {
        render(<Sidebar isMobile={true} />);
        const toggle = screen.getByRole("button", { name: "Toggle navigation" });
        for (let i = 0; i < toggleCount; i++) {
          fireEvent.click(toggle);
        }
        const expectedOpen = toggleCount % 2 === 1;
        expect(toggle).toHaveAttribute("aria-expanded", expectedOpen ? "true" : "false");
      });
    });

    const linkNames = ["Home", "Savings", "Groups", "Payments", "Settings", "Start New Goal"];
    linkNames.forEach((name, idx) => {
      it(`1.10.${idx + 1} clicking navigation link "${name}" closes the mobile drawer`, () => {
        render(<Sidebar isMobile={true} />);
        const toggle = screen.getByRole("button", { name: "Toggle navigation" });
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");

        const link = screen.getByRole("link", { name: new RegExp(name, "i") });
        fireEvent.click(link);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  // =========================================================================
  // Dimension 2: Combinatorics
  // =========================================================================
  describe("Dimension 2: Combinatorics", () => {
    it("2.1 Escape key without modifiers closes open drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      fireEvent.keyDown(window, { key: "Escape" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.2 Escape + shiftKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", shiftKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.3 Escape + altKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", altKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.4 Escape + ctrlKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", ctrlKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.5 Escape + metaKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", metaKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.6 Escape + shiftKey + altKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", shiftKey: true, altKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.7 Escape + shiftKey + ctrlKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", shiftKey: true, ctrlKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.8 Escape + altKey + ctrlKey closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape", altKey: true, ctrlKey: true });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("2.9 Escape + all 4 modifier keys closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      fireEvent.keyDown(window, {
        key: "Escape",
        shiftKey: true,
        altKey: true,
        ctrlKey: true,
        metaKey: true,
      });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    const nonEscapeKeys = [
      "Enter", "Space", "Tab", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight",
      "Home", "End", "PageUp", "PageDown", "a", "z", "0", "9",
      "F1", "F5", "F12", "Backspace", "Delete", "CapsLock", "Control", "Alt", "Shift", "Meta"
    ];

    nonEscapeKeys.forEach((key, idx) => {
      it(`2.10.${idx + 1} pressing key "${key}" does not close the open drawer`, () => {
        render(<Sidebar isMobile={true} />);
        const toggle = screen.getByRole("button", { name: "Toggle navigation" });
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");

        fireEvent.keyDown(window, { key });
        expect(toggle).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("2.11 Tab on last element without Shift wraps to first element", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      const focusable = aside.querySelectorAll<HTMLElement>("a");
      const last = focusable[focusable.length - 1];
      const first = focusable[0];

      last.focus();
      expect(document.activeElement).toBe(last);

      fireEvent.keyDown(aside, { key: "Tab", shiftKey: false });
      expect(document.activeElement).toBe(first);
    });

    it("2.12 Shift+Tab on first element wraps to last element", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      const focusable = aside.querySelectorAll<HTMLElement>("a");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      first.focus();
      expect(document.activeElement).toBe(first);

      fireEvent.keyDown(aside, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(last);
    });

    it("2.13 Tab on middle element does not interfere with normal forward tab order", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      const focusable = aside.querySelectorAll<HTMLElement>("a");
      const middle = focusable[2];
      middle.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: false, cancelable: true });
      const prevented = !aside.dispatchEvent(event);
      expect(prevented).toBe(false);
    });

    it("2.14 Shift+Tab on middle element does not interfere with normal backward tab order", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      const focusable = aside.querySelectorAll<HTMLElement>("a");
      const middle = focusable[2];
      middle.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true });
      const prevented = !aside.dispatchEvent(event);
      expect(prevented).toBe(false);
    });

    it("2.15 Tab keydown when drawer is closed on mobile does not trap focus", () => {
      render(<Sidebar isMobile={true} />);
      const aside = screen.getByRole("complementary", { hidden: true });
      const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
      const prevented = !aside.dispatchEvent(event);
      expect(prevented).toBe(false);
    });

    it("2.16 Tab keydown on desktop mode does not trap focus", () => {
      render(<Sidebar isMobile={false} />);
      const aside = screen.getByRole("complementary");
      const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
      const prevented = !aside.dispatchEvent(event);
      expect(prevented).toBe(false);
    });

    it("2.17 Desktop mode (isMobile=false): aside is always visible and never inert", () => {
      render(<Sidebar isMobile={false} />);
      const aside = screen.getByRole("complementary");
      expect(aside).not.toHaveAttribute("inert");
      expect(aside).not.toHaveAttribute("aria-hidden");
      expect(screen.queryByLabelText("Close navigation")).toBeNull();
    });

    it("2.18 Desktop mode (isMobile=false): links always have normal tab index", () => {
      render(<Sidebar isMobile={false} />);
      const aside = screen.getByRole("complementary");
      const links = aside.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).not.toHaveAttribute("tabindex");
      });
    });
  });

  // =========================================================================
  // Dimension 3: Host Variations & DOM structures
  // =========================================================================
  describe("Dimension 3: Host Variations & DOM Structures", () => {
    it("3.1 Toggle button has type='button'", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      expect(toggle).toHaveAttribute("type", "button");
    });

    it("3.2 Toggle button aria-controls matches aside id", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      const aside = screen.getByRole("complementary", { hidden: true });
      expect(toggle.getAttribute("aria-controls")).toBe(aside.getAttribute("id"));
    });

    it("3.3 Toggle renders Menu icon when closed and X icon when open", () => {
      const { container } = render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      expect(container.querySelector(".lucide-menu")).not.toBeNull();
      expect(container.querySelector(".lucide-x")).toBeNull();

      fireEvent.click(toggle);
      expect(container.querySelector(".lucide-menu")).toBeNull();
      expect(container.querySelector(".lucide-x")).not.toBeNull();
    });

    it("3.4 Icons inside toggle have aria-hidden='true'", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      const closedSvg = toggle.querySelector("svg");
      expect(closedSvg).toHaveAttribute("aria-hidden", "true");

      fireEvent.click(toggle);
      const openSvg = toggle.querySelector("svg");
      expect(openSvg).toHaveAttribute("aria-hidden", "true");
    });

    it("3.5 Mobile dismiss overlay is not rendered when drawer is closed", () => {
      render(<Sidebar isMobile={true} />);
      expect(screen.queryByRole("button", { name: "Close navigation" })).toBeNull();
    });

    it("3.6 Mobile dismiss overlay is rendered with role button and accessible name when open", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const overlay = screen.getByRole("button", { name: "Close navigation" });
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute("type", "button");
    });

    it("3.7 Clicking dismiss overlay closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const overlay = screen.getByRole("button", { name: "Close navigation" });
      fireEvent.click(overlay);

      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("3.8 Dismiss overlay is never rendered on desktop mode even if toggled", () => {
      render(<Sidebar isMobile={false} />);
      expect(screen.queryByRole("button", { name: "Close navigation" })).toBeNull();
    });

    it("3.9 Aside has accessible id and label", () => {
      render(<Sidebar isMobile={true} />);
      const aside = screen.getByRole("complementary", { hidden: true });
      expect(aside).toHaveAttribute("id", "mobile-sidebar");
      expect(aside).toHaveAttribute("aria-label", "Sidebar navigation");
    });

    it("3.10 Main navigation element has aria-label='Main menu'", () => {
      render(<Sidebar isMobile={true} />);
      const nav = screen.getByRole("navigation", { hidden: true });
      expect(nav).toHaveAttribute("aria-label", "Main menu");
    });

    it("3.11 Renders all 5 core navigation links with correct hrefs", () => {
      render(<Sidebar isMobile={true} />);
      const expected = [
        { name: "Home", href: "/dashboard" },
        { name: "Savings", href: "/groups" },
        { name: "Groups", href: "/groups" },
        { name: "Payments", href: "/payments" },
        { name: "Settings", href: "/profile" },
      ];

      expected.forEach(({ name, href }) => {
        const link = screen.getByRole("link", { name: new RegExp(name, "i"), hidden: true });
        expect(link).toHaveAttribute("href", href);
      });
    });

    it("3.12 Renders 'Start New Goal' button with href '/groups'", () => {
      render(<Sidebar isMobile={true} />);
      const goalLink = screen.getByRole("link", { name: "Start New Goal", hidden: true });
      expect(goalLink).toHaveAttribute("href", "/groups");
    });
  });

  // =========================================================================
  // Dimension 4: Negative Controls & Isolation
  // =========================================================================
  describe("Dimension 4: Negative Controls & Isolation", () => {
    it("4.1 Clicking inside drawer body does not close drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      fireEvent.click(aside);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    it("4.2 Clicking static text in drawer does not close drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const heading = screen.getByText("Your vault is growing");
      fireEvent.click(heading);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    it("4.3 Escape when already closed produces zero state changes or side effects", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");

      fireEvent.keyDown(window, { key: "Escape" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    const nonModifyingEvents = ["mousemove", "scroll", "resize", "wheel", "contextmenu"];
    nonModifyingEvents.forEach((eventName, idx) => {
      it(`4.4.${idx + 1} firing event "${eventName}" does not close the open drawer`, () => {
        render(<Sidebar isMobile={true} />);
        const toggle = screen.getByRole("button", { name: "Toggle navigation" });
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");

        fireEvent(window, new Event(eventName));
        expect(toggle).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("4.5 Desktop mode ignores Escape key events", () => {
      render(<Sidebar isMobile={false} />);
      const aside = screen.getByRole("complementary");
      expect(aside).not.toHaveAttribute("inert");

      fireEvent.keyDown(window, { key: "Escape" });
      expect(aside).not.toHaveAttribute("inert");
    });
  });

  // =========================================================================
  // Dimension 5: Lifecycle, Focus Management & Stress
  // =========================================================================
  describe("Dimension 5: Lifecycle, Focus Management & Stress", () => {
    it("5.1 moves focus into first navigation link on drawer open", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const aside = screen.getByRole("complementary");
      const firstLink = aside.querySelector("a");
      expect(document.activeElement).toBe(firstLink);
    });

    it("5.2 returns focus to toggle button when closed via Escape", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      toggle.focus();
      fireEvent.click(toggle);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(document.activeElement).toBe(toggle);
    });

    it("5.3 returns focus to toggle button when closed via overlay click", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      toggle.focus();
      fireEvent.click(toggle);

      const overlay = screen.getByRole("button", { name: "Close navigation" });
      fireEvent.click(overlay);

      expect(document.activeElement).toBe(toggle);
    });

    it("5.4 removes window keydown listener cleanly on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      unmount();
      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("5.5 unmounting while closed does not throw or leak listeners", () => {
      const { unmount } = render(<Sidebar isMobile={true} />);
      expect(() => unmount()).not.toThrow();
    });

    it("5.6 50 consecutive click toggles maintain state integrity", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });

      for (let i = 0; i < 50; i++) {
        fireEvent.click(toggle);
      }
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.7 50 consecutive Escape presses while open gracefully close once", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      for (let i = 0; i < 50; i++) {
        fireEvent.keyDown(window, { key: "Escape" });
      }
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.8 alternating open, tab, escape cycles maintain predictable focus and aria states", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });

      for (let i = 0; i < 5; i++) {
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        fireEvent.keyDown(window, { key: "Escape" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
      }
    });

    const viewportSizes = [
      { width: 320, isMobile: true },
      { width: 480, isMobile: true },
      { width: 767, isMobile: true },
      { width: 768, isMobile: false },
      { width: 1024, isMobile: false },
      { width: 1440, isMobile: false },
    ];

    viewportSizes.forEach(({ width, isMobile }, idx) => {
      it(`5.9.${idx + 1} simulates window.matchMedia for viewport width ${width}px`, () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
          matches: query.includes("max-width: 767px") ? isMobile : !isMobile,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }));

        render(<Sidebar />);
        const aside = screen.getByRole("complementary", { hidden: true });
        if (isMobile) {
          expect(aside).toHaveAttribute("inert");
          expect(aside).toHaveAttribute("aria-hidden", "true");
        } else {
          expect(aside).not.toHaveAttribute("inert");
          expect(aside).not.toHaveAttribute("aria-hidden");
        }
      });
    });

    it("5.10 pressing Space on dismiss overlay closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const overlay = screen.getByRole("button", { name: "Close navigation" });
      fireEvent.keyDown(overlay, { key: " ", code: "Space" });
      fireEvent.click(overlay);

      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.11 pressing Enter on dismiss overlay closes drawer", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);

      const overlay = screen.getByRole("button", { name: "Close navigation" });
      fireEvent.keyDown(overlay, { key: "Enter", code: "Enter" });
      fireEvent.click(overlay);

      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.12 aria-expanded transitions through full lifecycle: false -> true -> false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.13 clicking Home link closes drawer and resets aria-expanded to false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      const homeLink = screen.getByRole("link", { name: /home/i });
      fireEvent.click(homeLink);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.14 clicking Savings link closes drawer and resets aria-expanded to false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      const savingsLink = screen.getByRole("link", { name: /savings/i });
      fireEvent.click(savingsLink);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.15 clicking Groups link closes drawer and resets aria-expanded to false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      const groupsLink = screen.getByRole("link", { name: /groups/i });
      fireEvent.click(groupsLink);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.16 clicking Payments link closes drawer and resets aria-expanded to false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      const paymentsLink = screen.getByRole("link", { name: /payments/i });
      fireEvent.click(paymentsLink);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.17 clicking Settings link closes drawer and resets aria-expanded to false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      const settingsLink = screen.getByRole("link", { name: /settings/i });
      fireEvent.click(settingsLink);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("5.18 clicking Start New Goal link closes drawer and resets aria-expanded to false", () => {
      render(<Sidebar isMobile={true} />);
      const toggle = screen.getByRole("button", { name: "Toggle navigation" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      const goalLink = screen.getByRole("link", { name: /start new goal/i });
      fireEvent.click(goalLink);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });
  });
});
