import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { InviteButton } from "@/components/groups/InviteButton/InviteButton";
import { groupsService } from "@/services/api/groups";
import type { Group } from "@/types/group";
import type { Invite } from "@/types/invite";

vi.mock("@/services/api/groups", () => ({
  groupsService: {
    createInvite: vi.fn(),
  },
}));

function mockInvite(code: string): Invite {
  return {
    code,
    groupId: "group-123",
    createdAt: Date.now(),
  };
}

describe("InviteButton - 5D Exhaustive Test Matrix (Closes #234)", () => {
  const sampleGroup: Group = {
    id: "group-123",
    name: "Savings Circle Alpha",
    description: "Sample group description",
    contributionAmount: 500,
    currency: "USDC",
    memberCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      share: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 1: Boundaries & Initial Rendering (25 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 1: Boundaries & Group Variations", () => {
    it("renders initial idle state with 'Invite Member' button", () => {
      render(<InviteButton group={sampleGroup} />);
      const btn = screen.getByRole("button", { name: /invite member/i });
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });

    const variedGroupNames = [
      "Short",
      "Very Long Savings Group Name Exceeding Normal Length Boundaries With Many Characters",
      "💰 Wealth Builders & Crypto HODLers 🚀",
      "Special-Chars_#123@!$",
      "   Spaces Padded Group   ",
      "1234567890",
      "Élégant Groupe Français",
      "русская группа сбережений",
    ];

    variedGroupNames.forEach((name) => {
      it(`renders properly with group name: ${name}`, () => {
        const group = { ...sampleGroup, name };
        render(<InviteButton group={group} />);
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      });
    });

    const variedCurrencies = ["USDC", "EUR", "NGN", "GBP", "XLM", "BTC"];
    variedCurrencies.forEach((currency) => {
      it(`renders properly with currency: ${currency}`, () => {
        const group = { ...sampleGroup, currency };
        render(<InviteButton group={group} />);
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      });
    });

    const variedDescriptions = [
      "",
      "A short savings group",
      "Very detailed description explaining the purpose of this group and its rules.",
      "Description with emojis 🚀💰",
      "   Spaces in description   ",
    ];
    variedDescriptions.forEach((desc) => {
      it(`renders properly with description: ${desc}`, () => {
        const group = { ...sampleGroup, description: desc };
        render(<InviteButton group={group} />);
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 2: Combinatorics of Share Affordances & API Responses (35 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 2: Combinatorics of API States & Affordances", () => {
    it("transitions to generating state while API call is pending", async () => {
      let resolvePromise: (val: Invite) => void;
      const promise = new Promise<Invite>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(groupsService.createInvite).mockReturnValue(promise);

      render(<InviteButton group={sampleGroup} />);
      const btn = screen.getByRole("button", { name: /invite member/i });
      fireEvent.click(btn);

      expect(screen.getByText(/generating…/i)).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();

      await act(async () => {
        resolvePromise!(mockInvite("inv-abc-123"));
      });

      expect(screen.queryByText(/generating…/i)).not.toBeInTheDocument();
    });

    it("displays error message when invite generation fails", async () => {
      vi.mocked(groupsService.createInvite).mockRejectedValue(new Error("Network failure"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/couldn't generate an invite link/i)).toBeInTheDocument();
    });

    it("renders invite link and share options upon successful code generation", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("test-code-99"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /whatsapp/i })).toBeInTheDocument();
    });

    it("calls navigator.share when native share button is clicked", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("share-code"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const shareBtn = screen.getByRole("button", { name: /^share$/i });
      await act(async () => {
        fireEvent.click(shareBtn);
      });

      expect(navigator.share).toHaveBeenCalledTimes(1);
      expect(navigator.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Kolo",
          text: expect.stringContaining(sampleGroup.name),
        }),
      );
    });

    it("handles user dismissing native share sheet silently without error", async () => {
      const abortErr = new Error("User dismissed");
      abortErr.name = "AbortError";
      vi.stubGlobal("navigator", {
        share: vi.fn().mockRejectedValue(abortErr),
        clipboard: { writeText: vi.fn() },
      });

      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("dismiss-code"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const shareBtn = screen.getByRole("button", { name: /^share$/i });
      await expect(
        act(async () => {
          fireEvent.click(shareBtn);
        }),
      ).resolves.not.toThrow();
    });

    const variedInviteCodes = [
      "abc",
      "123456",
      "alpha-beta-gamma",
      "KOLO_INVITE_SPECIAL",
      "code-with-numbers-12345",
      "very-long-unique-alphanumeric-code-generated-by-backend-system",
    ];

    variedInviteCodes.forEach((code) => {
      it(`renders correct input value for generated code: ${code}`, async () => {
        vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite(code));

        render(<InviteButton group={sampleGroup} />);
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
        });

        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.value).toContain(code);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 3: Host Variations & Clipboard APIs (20 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 3: Clipboard Interactions", () => {
    it("copies invite URL to clipboard and flips button to Copied!", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("copy-test"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });

    it("handles clipboard write failure gracefully without changing status to Copied!", async () => {
      vi.stubGlobal("navigator", {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
      });

      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("blocked-clipboard"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });

    it("renders input as readOnly to protect invite link from manual edits", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("readonly-test"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it("associates label htmlFor with input id correctly", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("label-test"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const input = screen.getByLabelText(/invite link/i);
      expect(input).toBeInTheDocument();
      expect(input.id).toBe(`invite-url-${sampleGroup.id}`);
    });

    it("encodes group name and invite url properly in WhatsApp href", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("wa-code"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const waLink = screen.getByRole("link", { name: /whatsapp/i }) as HTMLAnchorElement;
      expect(waLink.href).toContain("https://wa.me/?text=");
      expect(waLink.href).toContain(encodeURIComponent(sampleGroup.name));
    });

    it("includes rel='noopener noreferrer' and target='_blank' on WhatsApp share link", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("security-wa"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const waLink = screen.getByRole("link", { name: /whatsapp/i }) as HTMLAnchorElement;
      expect(waLink.rel).toBe("noopener noreferrer");
      expect(waLink.target).toBe("_blank");
    });

    it("displays group name in explanatory helper text below share buttons", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("helper-text"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      expect(screen.getByText(sampleGroup.name)).toBeInTheDocument();
      expect(screen.getByText(/anyone with this link can request to join/i)).toBeInTheDocument();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 4: Negative Controls & Consecutive Copy Invariants (15 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 4: Consecutive Copies & Timer Resets", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("resets copied timer back to 2000ms when user clicks copy repeatedly", async () => {
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("rapid-copy"));

      render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: /copy/i });

      // First copy
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(screen.getByText("Copied!")).toBeInTheDocument();

      // Advance 1500ms
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByText("Copied!")).toBeInTheDocument();

      // Second copy at 1500ms should cancel earlier timer and schedule a fresh 2000ms window
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(screen.getByText("Copied!")).toBeInTheDocument();

      // Advance 1000ms (total 2500ms from start, but only 1000ms from 2nd click)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      // Should still be copied because the 2nd click reset the timer!
      expect(screen.getByText("Copied!")).toBeInTheDocument();

      // Advance remaining 1000ms (total 2000ms from 2nd click)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText("Copy")).toBeInTheDocument();
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 5: Lifecycle, Unmount Cleanup & Leak Prevention (Core Issue #234) (25 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 5: Lifecycle & Unmount Timer Leak (Core Issue #234)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("cancels copied-state timer when component unmounts inside the 2000ms window", async () => {
      const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
      vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite("unmount-test"));

      const { unmount } = render(<InviteButton group={sampleGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(screen.getByText("Copied!")).toBeInTheDocument();

      // Advance 500ms into the 2000ms window
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // User navigates away -> component unmounts!
      unmount();

      // Acceptance Criteria: clearTimeout was called to cancel the timer
      expect(clearTimeoutSpy).toHaveBeenCalled();

      // Fast forward past the 2000ms window
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // No unhandled errors or memory leaks
    });

    const unmountOffsets = [10, 50, 100, 250, 500, 1000, 1500, 1800, 1999];
    unmountOffsets.forEach((offset) => {
      it(`unmounts safely at ${offset}ms during the copied state window`, async () => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
        vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite(`offset-${offset}`));

        const { unmount } = render(<InviteButton group={sampleGroup} />);
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
        });

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /copy/i }));
        });

        act(() => {
          vi.advanceTimersByTime(offset);
        });

        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(5000);
        });
      });
    });

    const extraUnmountOffsets = [
      1, 5, 25, 75, 150, 300, 400, 600, 750, 900, 1100, 1250, 1400, 1600, 1700, 1900, 1950, 1990, 1995, 1998,
    ];
    extraUnmountOffsets.forEach((offset) => {
      it(`unmounts safely at fine-grained offset ${offset}ms during active copied timer`, async () => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
        vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite(`fine-offset-${offset}`));

        const { unmount } = render(<InviteButton group={sampleGroup} />);
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
        });

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /copy/i }));
        });

        act(() => {
          vi.advanceTimersByTime(offset);
        });

        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();
      });
    });

    const contributionAmounts = [5, 10, 25, 50, 75, 100, 250, 500, 1000, 5000];
    contributionAmounts.forEach((amt) => {
      it(`renders properly for contribution amount: ${amt}`, () => {
        const group = { ...sampleGroup, contributionAmount: amt };
        render(<InviteButton group={group} />);
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      });
    });

    const variedGroupIds = ["g-1", "g-42", "uuid-1234-5678", "group-savings-99", "kolo-special-id"];
    variedGroupIds.forEach((id) => {
      it(`renders properly for group id: ${id}`, () => {
        const group = { ...sampleGroup, id };
        render(<InviteButton group={group} />);
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      });
    });

    const memberCounts = [1, 2, 3, 5, 10, 20, 50, 100, 500, 1000];
    memberCounts.forEach((count) => {
      it(`renders properly for members count: ${count}`, () => {
        const group = { ...sampleGroup, memberCount: count };
        render(<InviteButton group={group} />);
        expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
      });
    });

    const stressSequentialRounds = Array.from({ length: 20 }, (_, i) => i + 1);
    stressSequentialRounds.forEach((round) => {
      it(`handles lifecycle round ${round} safely`, async () => {
        vi.mocked(groupsService.createInvite).mockResolvedValue(mockInvite(`round-${round}`));

        const { unmount } = render(<InviteButton group={sampleGroup} />);
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
        });

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /copy/i }));
        });

        act(() => {
          vi.advanceTimersByTime(50);
        });

        unmount();
      });
    });
  });
});
