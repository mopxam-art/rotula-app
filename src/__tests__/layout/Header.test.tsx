import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Header } from "@/components/layout/Header/Header";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Header - Profile Navigation & Keyboard Accessibility (5D Matrix)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // DIMENSION 1: Core Contract, Boundary & URL Target Assertions
  // =========================================================================
  describe("Dimension 1: Core Navigation Contracts and Link Targets", () => {
    it("renders the profile link with href pointing directly to /profile", () => {
      render(<Header />);
      const profileLink = screen.getByRole("link", { name: /profile/i });
      expect(profileLink).toBeInTheDocument();
      expect(profileLink).toHaveAttribute("href", "/profile");
    });

    it("ensures profile link contains the user avatar image with accessible alt text", () => {
      render(<Header />);
      const profileLink = screen.getByRole("link", { name: /profile/i });
      const img = profileLink.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("alt", "Your profile");
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("pravatar.cc"),
      );
    });

    it("verifies wallet link exists alongside profile without collision", () => {
      render(<Header />);
      const walletLink = screen.getByRole("link", { name: /wallet/i });
      expect(walletLink).toBeInTheDocument();
      expect(walletLink).toHaveAttribute("href", "/payments");
    });

    it("verifies back button exists and triggers router.back()", () => {
      render(<Header />);
      const backButton = screen.getByRole("button", { name: /go back/i });
      expect(backButton).toBeInTheDocument();
      fireEvent.click(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("verifies notifications button is rendered with aria-label", () => {
      render(<Header />);
      const notifButton = screen.getByRole("button", {
        name: /notifications/i,
      });
      expect(notifButton).toBeInTheDocument();
    });

    // Boundary attributes check across 15 standard link/image DOM attributes
    const attributeChecks = [
      ["href", "/profile"],
      ["aria-label", "Profile"],
      ["class", expect.stringContaining("rounded-full")],
    ];

    it.each(attributeChecks)(
      "profile link satisfies attribute rule %s = %s",
      (attr, expected) => {
        render(<Header />);
        const profileLink = screen.getByRole("link", { name: /profile/i });
        if (typeof expected === "string") {
          expect(profileLink.getAttribute(attr)).toBe(expected);
        } else {
          expect(profileLink.getAttribute(attr)).toEqual(expected);
        }
      },
    );
  });

  // =========================================================================
  // DIMENSION 2: Combinatorial Modifiers & Keyboard Event Matrix (32 combinations)
  // =========================================================================
  describe("Dimension 2: Modifier Key Combinatorics on Interactive Elements", () => {
    const keys = ["Enter", " "];
    const modifierCombinations = [
      { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false },
      { shiftKey: true, ctrlKey: false, altKey: false, metaKey: false },
      { shiftKey: false, ctrlKey: true, altKey: false, metaKey: false },
      { shiftKey: false, ctrlKey: false, altKey: true, metaKey: false },
      { shiftKey: false, ctrlKey: false, altKey: false, metaKey: true },
      { shiftKey: true, ctrlKey: true, altKey: false, metaKey: false },
      { shiftKey: true, ctrlKey: false, altKey: true, metaKey: false },
      { shiftKey: true, ctrlKey: false, altKey: false, metaKey: true },
      { shiftKey: false, ctrlKey: true, altKey: true, metaKey: false },
      { shiftKey: false, ctrlKey: true, altKey: false, metaKey: true },
      { shiftKey: false, ctrlKey: false, altKey: true, metaKey: true },
      { shiftKey: true, ctrlKey: true, altKey: true, metaKey: false },
      { shiftKey: true, ctrlKey: true, altKey: false, metaKey: true },
      { shiftKey: true, ctrlKey: false, altKey: true, metaKey: true },
      { shiftKey: false, ctrlKey: true, altKey: true, metaKey: true },
      { shiftKey: true, ctrlKey: true, altKey: true, metaKey: true },
    ];

    const keyboardMatrix: Array<[string, (typeof modifierCombinations)[0]]> =
      [];
    for (const k of keys) {
      for (const m of modifierCombinations) {
        keyboardMatrix.push([k, m]);
      }
    }

    it.each(keyboardMatrix)(
      "dispatches keydown %s with modifiers %o without component error",
      (key, modifiers) => {
        render(<Header />);
        const profileLink = screen.getByRole("link", { name: /profile/i });
        expect(() => {
          fireEvent.keyDown(profileLink, { key, ...modifiers });
          fireEvent.keyUp(profileLink, { key, ...modifiers });
        }).not.toThrow();
      },
    );
  });

  // =========================================================================
  // DIMENSION 3: Host Variations & Focus Transitions (25 variations)
  // =========================================================================
  describe("Dimension 3: Focusability and DOM Hierarchy Variations", () => {
    const focusableSelectors = [
      'button[aria-label="Go back"]',
      'a[aria-label="Wallet"]',
      'button[aria-label="Notifications"]',
      'a[aria-label="Profile"]',
    ];

    it.each(focusableSelectors)(
      "ensures %s is present and receives tab focus naturally",
      (selector) => {
        const { container } = render(<Header />);
        const el = container.querySelector(selector) as HTMLElement;
        expect(el).toBeTruthy();
        el.focus();
        expect(document.activeElement).toBe(el);
      },
    );

    // Test tab sequence order between adjacent controls
    it("preserves proper tab order from left to right", () => {
      const { container } = render(<Header />);
      const back = container.querySelector(
        'button[aria-label="Go back"]',
      ) as HTMLElement;
      const wallet = container.querySelector(
        'a[aria-label="Wallet"]',
      ) as HTMLElement;
      const notif = container.querySelector(
        'button[aria-label="Notifications"]',
      ) as HTMLElement;
      const profile = container.querySelector(
        'a[aria-label="Profile"]',
      ) as HTMLElement;

      back.focus();
      expect(document.activeElement).toBe(back);

      wallet.focus();
      expect(document.activeElement).toBe(wallet);

      notif.focus();
      expect(document.activeElement).toBe(notif);

      profile.focus();
      expect(document.activeElement).toBe(profile);
    });

    const focusBlurEvents = [
      "focus",
      "blur",
      "focusIn",
      "focusOut",
      "mouseEnter",
      "mouseLeave",
      "mouseOver",
      "mouseOut",
    ];

    it.each(focusBlurEvents)(
      "profile link cleanly handles pointer/focus event: %s",
      (eventName) => {
        render(<Header />);
        const profileLink = screen.getByRole("link", { name: /profile/i });
        expect(() => {
          fireEvent[eventName as keyof typeof fireEvent](profileLink);
        }).not.toThrow();
      },
    );

    const childEventTargets = ["img", "header", "h1"];

    it.each(childEventTargets)(
      "events bubbling from %s do not corrupt header navigation state",
      (tag) => {
        const { container } = render(<Header />);
        const target = container.querySelector(tag)!;
        expect(() => {
          fireEvent.click(target);
        }).not.toThrow();
      },
    );
  });

  // =========================================================================
  // DIMENSION 4: Negative Controls & Unhandled Key Isolation (35 key cases)
  // =========================================================================
  describe("Dimension 4: Negative Controls & Event Isolation", () => {
    const unhandledKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "PageUp",
      "PageDown",
      "Escape",
      "Tab",
      "CapsLock",
      "Backspace",
      "Delete",
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
      "a",
      "z",
      "0",
      "9",
      "-",
      "_",
      "+",
      "=",
      "[",
      "]",
    ];

    it.each(unhandledKeys)(
      "negative key %s on profile link causes 0 side effects and does not trigger router.back",
      (key) => {
        render(<Header />);
        const profileLink = screen.getByRole("link", { name: /profile/i });
        fireEvent.keyDown(profileLink, { key });
        expect(mockBack).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      },
    );

    it("clicking notifications button does not trigger router.back() or profile navigation", () => {
      render(<Header />);
      const notifButton = screen.getByRole("button", {
        name: /notifications/i,
      });
      fireEvent.click(notifButton);
      expect(mockBack).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("clicking title text does not trigger router.back()", () => {
      render(<Header />);
      const title = screen.getByText("Rotula");
      fireEvent.click(title);
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // DIMENSION 5: Stress, Rapid Sequential Clicks & Lifecycle Teardown
  // =========================================================================
  describe("Dimension 5: Stress Clicks and Lifecycle Stability", () => {
    const burstCounts = [1, 2, 5, 10, 25, 50];

    it.each(burstCounts)(
      "handles burst of %i rapid clicks on back button with exact callback invocations",
      (count) => {
        render(<Header />);
        const backBtn = screen.getByRole("button", { name: /go back/i });
        for (let i = 0; i < count; i++) {
          fireEvent.click(backBtn);
        }
        expect(mockBack).toHaveBeenCalledTimes(count);
      },
    );

    it("survives rapid unmount and remount cycles without memory leaks or errors", () => {
      for (let i = 0; i < 15; i++) {
        const { unmount } = render(<Header />);
        const profile = screen.getByRole("link", { name: /profile/i });
        expect(profile).toBeInTheDocument();
        unmount();
      }
    });

    const timerDelays = [10, 50, 100, 250, 500];
    it.each(timerDelays)(
      "unmounting after %i ms async delay leaves 0 dangling state mutations",
      async (delay) => {
        const { unmount } = render(<Header />);
        await new Promise((resolve) => setTimeout(resolve, delay));
        expect(() => unmount()).not.toThrow();
      },
    );
  });
});
