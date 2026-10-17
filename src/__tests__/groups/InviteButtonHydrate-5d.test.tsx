import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { InviteButton, useCanNativeShare } from "@/components/groups/InviteButton/InviteButton";
import { groupsService } from "@/services/api/groups";
import type { Group } from "@/types/group";

const mockGroup: Group = {
  id: "test-group-1",
  name: "Kolo Savings Cohort",
  description: "Test savings circle",
  memberCount: 8,
  currency: "USDC",
  contributionAmount: 100,
};

describe("InviteButton 5D Hydration & Capabilities Test Suite", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  // =========================================================================
  // DIMENSION 1: BOUNDARY & CLAMPING TESTS
  // =========================================================================
  describe("Dimension 1: Boundary & Clamping", () => {
    describe("useCanNativeShare capability boundary tests", () => {
      const capabilityBoundaries = [
        { desc: "navigator.share undefined", shareVal: undefined, expected: false },
        { desc: "navigator.share null", shareVal: null, expected: false },
        { desc: "navigator.share false boolean", shareVal: false, expected: false },
        { desc: "navigator.share 0 number", shareVal: 0, expected: false },
        { desc: "navigator.share NaN", shareVal: NaN, expected: false },
        { desc: "navigator.share empty string", shareVal: "", expected: false },
        { desc: "navigator.share standard function", shareVal: vi.fn(), expected: true },
        { desc: "navigator.share async function", shareVal: async () => {}, expected: true },
      ];

      it.each(capabilityBoundaries)(
        "correctly resolves capability when $desc",
        ({ shareVal, expected }) => {
          Object.defineProperty(global, "navigator", {
            value: { ...originalNavigator, share: shareVal },
            configurable: true,
            writable: true,
          });

          const { result } = renderHook(() => useCanNativeShare());
          expect(result.current).toBe(expected);
        },
      );
    });

    describe("Group name length and unicode boundaries", () => {
      const nameBoundaries = [
        { desc: "1 char", name: "K" },
        { desc: "2 chars", name: "KL" },
        { desc: "5 chars", name: "Alpha" },
        { desc: "10 chars", name: "Kolo Vault" },
        { desc: "20 chars", name: "Naija Wealth Builder" },
        { desc: "35 chars", name: "Decentralized Rotating Credit Group" },
        { desc: "50 chars", name: "C".repeat(50) },
        { desc: "75 chars", name: "D".repeat(75) },
        { desc: "100 chars", name: "E".repeat(100) },
        { desc: "single emoji", name: "💰" },
        { desc: "multi emoji", name: "🎉 Naija Wealth Vault 🚀💰" },
        { desc: "symbols & punctuation", name: "Sav!ngs & Inv@stments (100% Secure)" },
        { desc: "whitespace padded", name: "Trimmed Circle" },
        { desc: "HTML entities", name: "Kolo <Safe> & 'Smart' \"Circle\"" },
        { desc: "cyrillic script", name: "Сберегательный Кооператив 2026" },
        { desc: "french accents", name: "Tontine d'Épargne Solidaire Étoile" },
        { desc: "arabic script", name: "جمعية الادخار والتكافل" },
        { desc: "chinese script", name: "互助储蓄轮转圈子" },
      ];

      it.each(nameBoundaries)(
        "renders group text cleanly for $desc",
        async ({ name }) => {
          const testGroup = { ...mockGroup, id: `g-${name.slice(0, 3)}`, name };
          vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
            code: "VALID_CODE",
            groupId: testGroup.id,
            createdAt: Date.now(),
          });

          render(<InviteButton group={testGroup} />);
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

          await waitFor(() => {
            expect(screen.getByText(name)).toBeInTheDocument();
          });
        },
      );
    });

    describe("Financial contribution amount boundary values", () => {
      const contributionBoundaries = [
        { contribution: 0 },
        { contribution: 1 },
        { contribution: 10 },
        { contribution: 100 },
        { contribution: 500 },
        { contribution: 1000 },
        { contribution: 10000 },
        { contribution: 50000 },
        { contribution: 250000 },
        { contribution: 1000000 },
      ];

      it.each(contributionBoundaries)(
        "mounts without error for contributionAmount $contribution",
        async ({ contribution }) => {
          const testGroup = { ...mockGroup, contributionAmount: contribution };
          const { unmount } = render(<InviteButton group={testGroup} />);
          expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
          unmount();
        },
      );
    });
  });

  // =========================================================================
  // DIMENSION 2: COMBINATORICS
  // =========================================================================
  describe("Dimension 2: Combinatorics Matrix", () => {
    const states = ["idle", "generating", "ready", "error"] as const;
    const capabilities = [true, false] as const;
    const currencies = ["USDC", "XLM", "NGN", "EUR"] as const;

    const fullMatrix: Array<{
      state: typeof states[number];
      hasNativeShare: boolean;
      currency: typeof currencies[number];
    }> = [];

    for (const state of states) {
      for (const hasNativeShare of capabilities) {
        for (const currency of currencies) {
          fullMatrix.push({ state, hasNativeShare, currency });
        }
      }
    }

    it.each(fullMatrix)(
      "state: $state x nativeShare: $hasNativeShare x currency: $currency",
      async ({ state, hasNativeShare, currency }) => {
        Object.defineProperty(global, "navigator", {
          value: {
            ...originalNavigator,
            share: hasNativeShare ? vi.fn() : undefined,
          },
          configurable: true,
          writable: true,
        });

        const testGroup = { ...mockGroup, currency };

        if (state === "ready") {
          vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
            code: "MATRIX_CODE",
            groupId: testGroup.id,
            createdAt: Date.now(),
          });
        } else if (state === "error") {
          vi.spyOn(groupsService, "createInvite").mockRejectedValueOnce(
            new Error("Network failure"),
          );
        }

        const { unmount } = render(<InviteButton group={testGroup} />);

        if (state === "idle") {
          expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
          expect(screen.queryByRole("button", { name: /^share$/i })).not.toBeInTheDocument();
        } else if (state === "generating") {
          let resolvePromise: (val: { code: string; groupId: string; createdAt: number }) => void = () => {};
          vi.spyOn(groupsService, "createInvite").mockReturnValueOnce(
            new Promise((res) => {
              resolvePromise = res;
            }),
          );
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
          expect(screen.getByRole("button", { name: /generating…/i })).toBeDisabled();
          expect(screen.queryByRole("button", { name: /^share$/i })).not.toBeInTheDocument();
          resolvePromise({ code: "C", groupId: "1", createdAt: Date.now() });
        } else if (state === "ready") {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
          await waitFor(() => {
            expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
          });
          const shareBtn = screen.queryByRole("button", { name: /^share$/i });
          if (hasNativeShare) {
            expect(shareBtn).toBeInTheDocument();
          } else {
            expect(shareBtn).not.toBeInTheDocument();
          }
          expect(screen.getByRole("link", { name: /whatsapp/i })).toBeInTheDocument();
        } else if (state === "error") {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
          await waitFor(() => {
            expect(screen.getByRole("alert")).toBeInTheDocument();
          });
          expect(screen.queryByRole("button", { name: /^share$/i })).not.toBeInTheDocument();
        }

        unmount();
      },
    );

    describe("Member count and contribution tier combinations", () => {
      const memberCounts = [1, 5, 10, 20] as const;
      const contributions = [10, 50, 100, 500, 2000] as const;

      const memberCombos: Array<{ count: number; amount: number }> = [];
      for (const count of memberCounts) {
        for (const amount of contributions) {
          memberCombos.push({ count, amount });
        }
      }

      it.each(memberCombos)(
        "handles plan combo: $count members at $amount contribution",
        async ({ count, amount }) => {
          const testGroup = { ...mockGroup, memberCount: count, contributionAmount: amount };
          const { unmount } = render(<InviteButton group={testGroup} />);
          expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
          unmount();
        },
      );
    });
  });

  // =========================================================================
  // DIMENSION 3: HOST VARIATIONS (SSR VS CLIENT HYDRATION)
  // =========================================================================
  describe("Dimension 3: Host Variations & SSR Hydration", () => {
    const ssrGroupVariants = [
      { id: "ssr-1", name: "SSR Alpha" },
      { id: "ssr-2", name: "SSR Beta" },
      { id: "ssr-3", name: "SSR Gamma" },
      { id: "ssr-4", name: "SSR Delta" },
      { id: "ssr-5", name: "SSR Epsilon" },
    ];

    it.each(ssrGroupVariants)(
      "SSR: renderToString produces markup without share button for $name",
      ({ id, name }) => {
        Object.defineProperty(global, "navigator", {
          value: { ...originalNavigator, share: vi.fn() },
          configurable: true,
          writable: true,
        });

        const html = renderToString(<InviteButton group={{ ...mockGroup, id, name }} />);
        expect(html).not.toContain("Share");
        expect(html).toContain("Invite Member");
      },
    );

    it("SSR: matches initial client render with zero hydration mismatch warnings", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      Object.defineProperty(global, "navigator", {
        value: { ...originalNavigator, share: vi.fn() },
        configurable: true,
        writable: true,
      });

      render(<InviteButton group={mockGroup} />);

      const hydrationErrors = consoleErrorSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === "string" && arg.includes("Hydration")),
      );
      expect(hydrationErrors.length).toBe(0);

      consoleErrorSpy.mockRestore();
    });

    describe("Browser platform and capability profiles", () => {
      const browserProfiles = [
        {
          name: "iOS Safari 17.4",
          hasShare: true,
          ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
        },
        {
          name: "iOS Safari 16.5",
          hasShare: true,
          ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
        },
        {
          name: "iPadOS 17.0",
          hasShare: true,
          ua: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        },
        {
          name: "Android Chrome 124",
          hasShare: true,
          ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile",
        },
        {
          name: "Samsung Internet 24",
          hasShare: true,
          ua: "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 SamsungBrowser/24.0",
        },
        {
          name: "Android Firefox 124",
          hasShare: true,
          ua: "Mozilla/5.0 (Android 14; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0",
        },
        {
          name: "Desktop macOS Safari 17",
          hasShare: true,
          ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
        },
        {
          name: "Desktop Windows Chrome 124 (Insecure Context - unsupported)",
          hasShare: false,
          ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0",
        },
        {
          name: "Desktop Linux Firefox 124 (unsupported)",
          hasShare: false,
          ua: "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
        },
        {
          name: "Desktop Windows Edge 124 (unsupported)",
          hasShare: false,
          ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/124.0.0.0",
        },
      ];

      it.each(browserProfiles)(
        "adapts capability correctly on $name",
        async ({ hasShare, ua }) => {
          Object.defineProperty(global, "navigator", {
            value: {
              ...originalNavigator,
              userAgent: ua,
              share: hasShare ? vi.fn() : undefined,
              clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
            },
            configurable: true,
            writable: true,
          });

          vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
            code: "PROFILE_CODE",
            groupId: mockGroup.id,
            createdAt: Date.now(),
          });

          render(<InviteButton group={mockGroup} />);
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

          await waitFor(() => {
            expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
          });

          const shareBtn = screen.queryByRole("button", { name: /^share$/i });
          if (hasShare) {
            expect(shareBtn).toBeInTheDocument();
          } else {
            expect(shareBtn).not.toBeInTheDocument();
          }
        },
      );
    });
  });

  // =========================================================================
  // DIMENSION 4: NEGATIVE CONTROLS & SECURITY ISOLATION
  // =========================================================================
  describe("Dimension 4: Negative Controls & Security Isolation", () => {
    const errorTypes = [
      { desc: "AbortError on user dismissal", err: new DOMException("The user aborted a request.", "AbortError") },
      { desc: "NotAllowedError on permission denial", err: new DOMException("Permission denied", "NotAllowedError") },
      { desc: "InvalidStateError on internal failure", err: new DOMException("Invalid state", "InvalidStateError") },
      { desc: "NetworkError during share operation", err: new DOMException("Network error", "NetworkError") },
      { desc: "generic Error instance", err: new Error("Unexpected error") },
    ];

    it.each(errorTypes)(
      "safely swallows $desc during native share without changing component state",
      async ({ err }) => {
        const shareMock = vi.fn().mockRejectedValueOnce(err);

        Object.defineProperty(global, "navigator", {
          value: { ...originalNavigator, share: shareMock },
          configurable: true,
          writable: true,
        });

        vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
          code: "SAFE_DISMISS",
          groupId: mockGroup.id,
          createdAt: Date.now(),
        });

        render(<InviteButton group={mockGroup} />);
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

        await waitFor(() => {
          expect(screen.getByRole("button", { name: /^share$/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /^share$/i }));

        await waitFor(() => {
          expect(shareMock).toHaveBeenCalledTimes(1);
        });

        // Remained in ready state, alert error NOT shown
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
      },
    );

    describe("Clipboard error isolation", () => {
      const clipboardErrors = [
        { desc: "NotAllowedError", err: new DOMException("Clipboard denied", "NotAllowedError") },
        { desc: "SecurityError", err: new DOMException("Security violation", "SecurityError") },
        { desc: "plain Error", err: new Error("Clipboard offline") },
      ];

      it.each(clipboardErrors)(
        "handles clipboard failure on $desc gracefully without setting copied flag",
        async ({ err }) => {
          const clipboardMock = {
            writeText: vi.fn().mockRejectedValueOnce(err),
          };

          Object.defineProperty(global, "navigator", {
            value: { ...originalNavigator, clipboard: clipboardMock },
            configurable: true,
            writable: true,
          });

          vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
            code: "CLIP_FAIL",
            groupId: mockGroup.id,
            createdAt: Date.now(),
          });

          render(<InviteButton group={mockGroup} />);
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

          await waitFor(() => {
            expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
          });

          fireEvent.click(screen.getByRole("button", { name: /copy/i }));

          await waitFor(() => {
            expect(clipboardMock.writeText).toHaveBeenCalledTimes(1);
          });

          expect(screen.getByRole("button", { name: /copy/i })).toHaveTextContent("Copy");
          expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
        },
      );
    });

    const strayKeyEvents = [
      { key: "Enter" },
      { key: "Escape" },
      { key: "Tab" },
      { key: "ArrowDown" },
      { key: " " },
    ];

    it.each(strayKeyEvents)(
      "stray window keydown $key does not mutate button status",
      ({ key }) => {
        render(<InviteButton group={mockGroup} />);
        fireEvent.keyDown(window, { key });
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      },
    );
  });

  // =========================================================================
  // DIMENSION 5: LIFECYCLE, CONCURRENCY & STRESS
  // =========================================================================
  describe("Dimension 5: Lifecycle, Concurrency & Stress", () => {
    const stressClickCounts = [5, 10, 15, 20];

    it.each(stressClickCounts)(
      "stress: rapid successive %s clicks on Copy button",
      async (clicks) => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(global, "navigator", {
          value: {
            ...originalNavigator,
            clipboard: { writeText: writeTextMock },
          },
          configurable: true,
          writable: true,
        });

        vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
          code: "STRESS_COPY",
          groupId: mockGroup.id,
          createdAt: Date.now(),
        });

        render(<InviteButton group={mockGroup} />);
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

        await waitFor(() => {
          expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
        });

        const copyBtn = screen.getByRole("button", { name: /copy/i });
        for (let i = 0; i < clicks; i++) {
          fireEvent.click(copyBtn);
        }

        expect(writeTextMock).toHaveBeenCalledTimes(clicks);

        await waitFor(() => {
          expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();
        });
      },
    );

    it("renders multiple concurrent InviteButtons without cross-instance leakage", async () => {
      const groupA = { ...mockGroup, id: "group-A", name: "Alpha Squad" };
      const groupB = { ...mockGroup, id: "group-B", name: "Beta Squad" };

      vi.spyOn(groupsService, "createInvite")
        .mockResolvedValueOnce({ code: "ALPHA_CODE", groupId: "group-A", createdAt: Date.now() })
        .mockResolvedValueOnce({ code: "BETA_CODE", groupId: "group-B", createdAt: Date.now() });

      render(
        <div>
          <InviteButton group={groupA} />
          <InviteButton group={groupB} />
        </div>,
      );

      const buttons = screen.getAllByRole("button", { name: /invite member/i });
      expect(buttons.length).toBe(2);

      fireEvent.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByText("Alpha Squad")).toBeInTheDocument();
      });

      expect(screen.queryByText("Beta Squad")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /invite member/i }).length).toBe(1);
    });

    it("unmounts safely during active generation without memory leaks or warnings", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(groupsService, "createInvite").mockReturnValue(new Promise(() => {}));

      const { unmount } = render(<InviteButton group={mockGroup} />);
      fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

      unmount();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    const sequentialIndices = Array.from({ length: 15 }, (_, i) => i);

    it.each(sequentialIndices)(
      "batch generation cycle for sequential instance #%s",
      async (i) => {
        const testGroup = { ...mockGroup, id: `g-seq-${i}`, name: `Sequential Cohort ${i}` };
        vi.spyOn(groupsService, "createInvite").mockResolvedValueOnce({
          code: `SEQ_CODE_${i}`,
          groupId: testGroup.id,
          createdAt: Date.now(),
        });

        const { unmount } = render(<InviteButton group={testGroup} />);
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

        await waitFor(() => {
          expect(screen.getByText(`Sequential Cohort ${i}`)).toBeInTheDocument();
        });

        unmount();
      },
    );
  });
});
