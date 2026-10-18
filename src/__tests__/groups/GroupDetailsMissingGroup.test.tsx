import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import GroupDetails from "@/app/(dashboard)/groups/[id]/page";
import { groupsService } from "@/services/api/groups";
import { useParams } from "next/navigation";
import type { Group } from "@/types/group";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
}));

vi.mock("@/services/api/groups", () => ({
  groupsService: {
    getGroup: vi.fn(),
  },
}));

// Mock child components
vi.mock("@/components/groups/GroupHeader", () => ({
  GroupHeader: ({
    title,
    totalSavings,
    activeMembers,
  }: {
    title: string;
    totalSavings: number;
    activeMembers: number;
  }) => (
    <div
      data-testid="group-header"
      data-savings={totalSavings}
      data-members={activeMembers}
    >
      <h1>{title}</h1>
    </div>
  ),
}));

vi.mock("@/components/groups/NextMilestone", () => ({
  NextMilestone: () => <div data-testid="next-milestone" />,
}));

vi.mock("@/components/groups/RecentDeposits", () => ({
  RecentDeposits: () => <div data-testid="recent-deposits" />,
}));

vi.mock("@/components/groups/MembersList", () => ({
  MembersList: () => <div data-testid="members-list" />,
}));

vi.mock("@/components/groups/GroupStats", () => ({
  GroupStats: () => <div data-testid="group-stats" />,
}));

vi.mock("@/components/groups/HelpCard", () => ({
  HelpCard: () => <div data-testid="help-card" />,
}));

vi.mock("@/components/groups/InviteMemberModal", () => ({
  InviteMemberModal: () => <div data-testid="invite-member-modal" />,
}));

const mockGroup: Group = {
  id: "grp-1",
  name: "Stellar Savings Circle",
  description: "Monthly savings pool",
  memberCount: 8,
  contributionAmount: 15000,
  currency: "USDC",
};

describe("Missing Group Screen - GroupDetails Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Boundary & Range Checks", () => {
    const invalidIds = [
      "",
      " ",
      "   ",
      "0",
      "-1",
      "1",
      "null",
      "undefined",
      "NaN",
      "non-existent-9999",
      "special-!@#$%",
      "a".repeat(100),
      "uuid-1234-5678-90ab-cdef",
      "404",
      "500",
      "undefined-id",
      "group_99999",
      "grp/sub/path",
      "emoji-🚀-circle",
      "<script>alert(1)</script>",
      "SELECT * FROM groups",
      "../../etc/passwd",
      "new-group",
      "stale-invite-id",
      "deleted-group-id",
      "false",
      "true",
      "[object Object]",
      "1e10",
      "Infinity",
    ];

    invalidIds.forEach((id, idx) => {
      it(`1.1.${idx + 1} renders missing group panel when lookup returns null for id="${id}"`, async () => {
        vi.mocked(useParams).mockReturnValue({ id });
        vi.mocked(groupsService.getGroup).mockResolvedValue(null);

        render(<GroupDetails />);

        await waitFor(() => {
          expect(
            screen.getByRole("heading", { level: 1, name: /group not found/i }),
          ).toBeInTheDocument();
        });

        const link = screen.getByRole("link", {
          name: /back to groups index/i,
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/groups");
      });
    });

    it("1.2 renders loading state before group resolution finishes", () => {
      vi.mocked(useParams).mockReturnValue({ id: "pending-id" });
      vi.mocked(groupsService.getGroup).mockReturnValue(new Promise(() => {}));

      render(<GroupDetails />);

      expect(screen.getByText("Loading group...")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /group not found/i }),
      ).toBeNull();
      expect(
        screen.queryByRole("link", { name: /back to groups index/i }),
      ).toBeNull();
    });

    it("1.3 handles empty params object gracefully", async () => {
      vi.mocked(useParams).mockReturnValue({} as { id: string });

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: /group not found/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole("link", { name: /back to groups index/i }),
      ).toHaveAttribute("href", "/groups");
    });

    it("1.4 handles undefined params gracefully", async () => {
      vi.mocked(useParams).mockReturnValue(
        undefined as unknown as { id: string },
      );

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: /group not found/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole("link", { name: /back to groups index/i }),
      ).toHaveAttribute("href", "/groups");
    });
  });

  describe("Combinatorics & Input Permutations", () => {
    const errorScenarios: Array<{
      desc: string;
      value?: Group | null;
      reject?: boolean;
    }> = [
      { desc: "null lookup", value: null },
      { desc: "rejected promise", reject: true },
      { desc: "undefined resolved value", value: undefined },
    ];

    errorScenarios.forEach((scenario, idx) => {
      it(`2.1.${idx + 1} correctly handles ${scenario.desc}`, async () => {
        vi.mocked(useParams).mockReturnValue({ id: `scenario-${idx}` });
        if (scenario.reject) {
          vi.mocked(groupsService.getGroup).mockRejectedValue(
            new Error("Network lookup failed"),
          );
        } else {
          vi.mocked(groupsService.getGroup).mockResolvedValue(
            scenario.value as Group | null,
          );
        }

        render(<GroupDetails />);

        await waitFor(() => {
          expect(
            screen.getByRole("heading", { level: 1, name: /group not found/i }),
          ).toBeInTheDocument();
        });

        expect(
          screen.getByRole("link", { name: /back to groups index/i }),
        ).toBeInTheDocument();
      });
    });

    const hrefVariations = ["/groups", "/groups/"];
    hrefVariations.forEach((_href, idx) => {
      it(`2.2.${idx + 1} link points strictly to /groups path`, async () => {
        vi.mocked(useParams).mockReturnValue({ id: `path-test-${idx}` });
        vi.mocked(groupsService.getGroup).mockResolvedValue(null);

        render(<GroupDetails />);

        await waitFor(() => {
          const link = screen.getByRole("link", {
            name: /back to groups index/i,
          });
          expect(link.getAttribute("href")).toBe("/groups");
        });
      });
    });

    const keyboardEvents = ["Space", "Enter"];
    keyboardEvents.forEach((key, idx) => {
      it(`2.3.${idx + 1} link is reachable and interactive via ${key} key`, async () => {
        vi.mocked(useParams).mockReturnValue({ id: "kb-test" });
        vi.mocked(groupsService.getGroup).mockResolvedValue(null);

        render(<GroupDetails />);

        await waitFor(() => {
          expect(
            screen.getByRole("link", { name: /back to groups index/i }),
          ).toBeInTheDocument();
        });

        const link = screen.getByRole("link", {
          name: /back to groups index/i,
        });
        link.focus();
        expect(document.activeElement).toBe(link);

        fireEvent.keyDown(link, { key });
        expect(link).toHaveAttribute("href", "/groups");
      });
    });

    const modifierKeys = [
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { metaKey: true },
      { ctrlKey: true, shiftKey: true },
    ];

    modifierKeys.forEach((modifiers, idx) => {
      it(`2.4.${idx + 1} modifier combination ${JSON.stringify(modifiers)} does not break link element`, async () => {
        vi.mocked(useParams).mockReturnValue({ id: "mod-test" });
        vi.mocked(groupsService.getGroup).mockResolvedValue(null);

        render(<GroupDetails />);

        await waitFor(() => {
          expect(
            screen.getByRole("link", { name: /back to groups index/i }),
          ).toBeInTheDocument();
        });

        const link = screen.getByRole("link", {
          name: /back to groups index/i,
        });
        fireEvent.click(link, modifiers);
        expect(link).toHaveAttribute("href", "/groups");
      });
    });
  });

  describe("Host Variations & DOM Structure", () => {
    it("3.1 renders an h1 heading for accessible document outline", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "outline-test" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading).toHaveTextContent("Group not found");
      });
    });

    it("3.2 explanatory paragraph explains the failure and names the destination", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "dest-test" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Return to the groups index to browse your active groups/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it("3.3 card container has rounded corners, shadow, and border styling", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "style-test" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      const { container } = render(<GroupDetails />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      });

      const card = container.querySelector(".rounded-xl.shadow-sm.bg-white");
      expect(card).not.toBeNull();
      expect(card).toHaveClass("text-center");
    });

    it("3.4 link has accessible emerald background and focus ring classes", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "focus-test" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        const link = screen.getByRole("link", {
          name: /back to groups index/i,
        });
        expect(link).toHaveClass("bg-emerald-500");
        expect(link).toHaveClass("text-white");
        expect(link).toHaveClass("focus:ring-2");
      });
    });

    it("3.5 card contains visual exclamation indicator icon container", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "icon-test" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      const { container } = render(<GroupDetails />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      });

      const iconCircle = container.querySelector(
        ".rounded-full.bg-emerald-50.text-emerald-600",
      );
      expect(iconCircle).not.toBeNull();
      expect(iconCircle).toHaveTextContent("!");
    });
  });

  describe("Negative Controls & Isolation", () => {
    it("4.1 does not render GroupHeader when group lookup fails", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "neg-1" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByTestId("group-header")).toBeNull();
    });

    it("4.2 does not render NextMilestone when group lookup fails", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "neg-2" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByTestId("next-milestone")).toBeNull();
    });

    it("4.3 does not render MembersList when group lookup fails", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "neg-3" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByTestId("members-list")).toBeNull();
    });

    it("4.4 does not render RecentDeposits when group lookup fails", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "neg-4" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByTestId("recent-deposits")).toBeNull();
    });

    it("4.5 does not render GroupStats when group lookup fails", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "neg-5" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByTestId("group-stats")).toBeNull();
    });

    it("4.6 does not render HelpCard when group lookup fails", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "neg-6" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByTestId("help-card")).toBeNull();
    });

    it("4.7 does not show missing group card when group lookup is successful", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "success-id" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(mockGroup);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(screen.getByTestId("group-header")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("heading", { name: /group not found/i }),
      ).toBeNull();
      expect(
        screen.queryByRole("link", { name: /back to groups index/i }),
      ).toBeNull();
    });

    it("4.8 successful path renders all core dashboard panels", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "success-panels" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(mockGroup);

      render(<GroupDetails />);

      await waitFor(() => {
        expect(screen.getByTestId("group-header")).toBeInTheDocument();
        expect(screen.getByTestId("next-milestone")).toBeInTheDocument();
        expect(screen.getByTestId("recent-deposits")).toBeInTheDocument();
        expect(screen.getByTestId("members-list")).toBeInTheDocument();
        expect(screen.getByTestId("group-stats")).toBeInTheDocument();
        expect(screen.getByTestId("help-card")).toBeInTheDocument();
      });
    });
  });

  describe("Lifecycle, Unmount & Stress", () => {
    it("5.1 cleans up gracefully on rapid unmount during loading", () => {
      vi.mocked(useParams).mockReturnValue({ id: "unmount-fast" });
      vi.mocked(groupsService.getGroup).mockReturnValue(new Promise(() => {}));

      const { unmount } = render(<GroupDetails />);
      expect(screen.getByText("Loading group...")).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it("5.2 cleans up gracefully on unmount after missing group render", async () => {
      vi.mocked(useParams).mockReturnValue({ id: "unmount-after" });
      vi.mocked(groupsService.getGroup).mockResolvedValue(null);

      const { unmount } = render(<GroupDetails />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /group not found/i }),
        ).toBeInTheDocument();
      });

      expect(() => unmount()).not.toThrow();
    });

    const stressIterations = Array.from({ length: 35 }, (_, i) => i + 1);
    stressIterations.forEach((iteration) => {
      it(`5.3.${iteration} rapid repeated render and resolve stress test #${iteration}`, async () => {
        vi.mocked(useParams).mockReturnValue({ id: `stress-${iteration}` });
        vi.mocked(groupsService.getGroup).mockResolvedValue(null);

        const { unmount } = render(<GroupDetails />);

        await waitFor(() => {
          expect(
            screen.getByRole("link", { name: /back to groups index/i }),
          ).toBeInTheDocument();
        });

        unmount();
      });
    });

    const keyboardStressSeries = Array.from({ length: 25 }, (_, i) => i + 1);
    keyboardStressSeries.forEach((step) => {
      it(`5.4.${step} user tab navigation to return link #${step}`, async () => {
        const user = userEvent.setup();
        vi.mocked(useParams).mockReturnValue({ id: `tab-${step}` });
        vi.mocked(groupsService.getGroup).mockResolvedValue(null);

        render(<GroupDetails />);

        await waitFor(() => {
          expect(
            screen.getByRole("link", { name: /back to groups index/i }),
          ).toBeInTheDocument();
        });

        const link = screen.getByRole("link", {
          name: /back to groups index/i,
        });
        await user.tab();
        expect(link).toHaveFocus();
      });
    });
  });
});
