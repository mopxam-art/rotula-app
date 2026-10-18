import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MembersList, type Member } from "@/components/groups/MembersList";

describe("MembersList", () => {
  const mockMembers: Member[] = [
    {
      id: "m1",
      name: "Chidi Anagonye",
      role: "Admin",
      status: "CONTRIBUTED",
      avatarUrl: "https://example.com/chidi.jpg",
    },
    {
      id: "m2",
      name: "Tahani Al-Jamil",
      role: "Member",
      status: "WAITING",
    },
  ];

  it("renders an explicit empty state with invite action when members list is empty", async () => {
    const onInvite = vi.fn();
    const user = userEvent.setup();

    render(<MembersList members={[]} onInvite={onInvite} />);

    // Section heading remains visible
    expect(
      screen.getByRole("heading", { level: 3, name: /members/i }),
    ).toBeInTheDocument();

    // Empty state message and invite CTA are visible
    expect(screen.getByText("No members yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        /share an invite link to bring members into this circle/i,
      ),
    ).toBeInTheDocument();

    // Both the header button and the empty state CTA call onInvite
    const inviteButtons = screen.getAllByRole("button", {
      name: /invite member/i,
    });
    expect(inviteButtons).toHaveLength(2);

    // Click empty state button
    await user.click(inviteButtons[1]);
    expect(onInvite).toHaveBeenCalledTimes(1);

    // Click header icon button
    await user.click(inviteButtons[0]);
    expect(onInvite).toHaveBeenCalledTimes(2);

    // No member status badges or names rendered
    expect(screen.queryByText("Contributed")).not.toBeInTheDocument();
  });

  it("renders populated members with details and status badges", async () => {
    const onInvite = vi.fn();
    const user = userEvent.setup();

    render(<MembersList members={mockMembers} onInvite={onInvite} />);

    // Heading remains
    expect(
      screen.getByRole("heading", { level: 3, name: /members/i }),
    ).toBeInTheDocument();

    // Empty state is not rendered
    expect(screen.queryByText("No members yet")).not.toBeInTheDocument();

    // Members and their details. Status and role render as readable labels
    // rather than the raw enum values (see the status-label change).
    expect(screen.getByText("Chidi Anagonye")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Contributed")).toBeInTheDocument();

    expect(screen.getByText("Tahani Al-Jamil")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("Waiting")).toBeInTheDocument();

    // Fallback initial
    expect(screen.getByText("T")).toBeInTheDocument();

    // Header invite button is functional
    const headerInviteBtn = screen.getByLabelText("Invite member");
    await user.click(headerInviteBtn);
    expect(onInvite).toHaveBeenCalledTimes(1);
  });
});
