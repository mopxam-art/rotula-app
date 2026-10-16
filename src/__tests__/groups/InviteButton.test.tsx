import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InviteButton } from "@/components/groups/InviteButton/InviteButton";
import { groupsService } from "@/services/api/groups";
import type { Group } from "@/types/group";

const mockGroup: Group = {
  id: "test-group-1",
  name: "Community Circle",
  description: "Test group for invitations",
  memberCount: 5,
  currency: "USDC",
  contributionAmount: 50,
};

describe("InviteButton Comprehensive Suite", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(groupsService, "createInvite").mockResolvedValue({
      code: "inv123xyz",
      groupId: "test-group-1",
      createdAt: new Date().toISOString(),
    } as any);

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("initial and generating states", () => {
    it("renders the initial 'Invite Member' button", () => {
      render(<InviteButton group={mockGroup} />);
      expect(
        screen.getByRole("button", { name: /invite member/i }),
      ).toBeInTheDocument();
    });

    it("displays 'Generating…' and disables button during generation", async () => {
      let resolvePromise: (val: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.spyOn(groupsService, "createInvite").mockReturnValue(pendingPromise as any);

      render(<InviteButton group={mockGroup} />);
      const btn = screen.getByRole("button", { name: /invite member/i });
      fireEvent.click(btn);

      expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled();

      await act(async () => {
        resolvePromise!({
          code: "xyz789",
          groupId: "test-group-1",
          createdAt: new Date().toISOString(),
        });
      });

      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });

    it("displays error message when generation fails", async () => {
      vi.spyOn(groupsService, "createInvite").mockRejectedValue(new Error("Network failure"));

      render(<InviteButton group={mockGroup} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/couldn't generate an invite link/i)).toBeInTheDocument();
    });
  });

  describe("copy action and timer lifecycle (#234)", () => {
    it("generates invite link and displays copy button on click", async () => {
      render(<InviteButton group={mockGroup} />);

      const inviteButton = screen.getByRole("button", { name: /invite member/i });
      await act(async () => {
        fireEvent.click(inviteButton);
      });

      expect(groupsService.createInvite).toHaveBeenCalledWith("test-group-1");
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
      expect(screen.getByDisplayValue(/inv123xyz/)).toBeInTheDocument();
    });

    it("sets copied state when copy button is clicked and resets after 2000ms", async () => {
      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: "Copy" });
      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });

    it("cancels earlier timers on repeated copies and extends window", async () => {
      const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: "Copy" });
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();

      // Advance 1000ms
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Click copy again before 2000ms has elapsed
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copied!" }));
      });
      expect(clearTimeoutSpy).toHaveBeenCalled();

      // Advance another 1500ms (total 2500ms from 1st click, 1500ms from 2nd click)
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();

      // Advance remaining 500ms from 2nd click
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });

    it("handles 10 rapid repeated clicks safely without leaking timers", async () => {
      const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /cop/i }));
        });
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      // At this point, 9 timers should have been cleared
      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(9);
      expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();

      // Advance past remaining time from last click
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });

    it("cancels pending timer when unmounted during the 2000ms window (#234)", async () => {
      const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
      const consoleErrorSpy = vi.spyOn(console, "error");

      const { unmount } = render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const copyBtn = screen.getByRole("button", { name: "Copy" });
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();

      // Advance halfway through the window (1000ms)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Unmount while timer is pending
      unmount();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      // Advance past remaining time to verify no late state updates or warnings
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it.each([100, 500, 1500, 1999])(
      "unmounting at %ims into timer cancels pending timeout without state leakage",
      async (unmountTime) => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
        const { unmount } = render(<InviteButton group={mockGroup} />);

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
        });

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        });

        act(() => {
          vi.advanceTimersByTime(unmountTime);
        });

        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(5000);
        });
      }
    );

    it("handles clipboard rejection gracefully without crashing", async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
      });

      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      });

      // Should remain 'Copy' without unhandled rejection
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });
  });

  describe("sharing affordances", () => {
    it("selects input text on focus", async () => {
      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const selectSpy = vi.spyOn(input, "select");

      fireEvent.focus(input);
      expect(selectSpy).toHaveBeenCalled();
    });

    it("renders WhatsApp share link with encoded message and URL", async () => {
      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const waLink = screen.getByRole("link", { name: /whatsapp/i });
      expect(waLink).toHaveAttribute("target", "_blank");
      expect(waLink).toHaveAttribute("rel", "noopener noreferrer");
      expect(waLink.getAttribute("href")).toContain("https://wa.me/?text=");
      expect(waLink.getAttribute("href")).toContain("Community%20Circle");
    });

    it("invokes navigator.share when native share is available and clicked", async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { share: shareMock });

      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const shareBtn = screen.getByRole("button", { name: /share/i });
      await act(async () => {
        fireEvent.click(shareBtn);
      });

      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Kolo",
          text: expect.stringContaining("Community Circle"),
          url: expect.stringContaining("inv123xyz"),
        })
      );
    });

    it("handles user dismissal of native share sheet silently", async () => {
      const shareMock = vi.fn().mockRejectedValue(new DOMException("Share cancelled", "AbortError"));
      Object.assign(navigator, { share: shareMock });

      render(<InviteButton group={mockGroup} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /invite member/i }));
      });

      const shareBtn = screen.getByRole("button", { name: /share/i });
      await act(async () => {
        fireEvent.click(shareBtn);
      });

      expect(shareMock).toHaveBeenCalled();
    });
  });
});
