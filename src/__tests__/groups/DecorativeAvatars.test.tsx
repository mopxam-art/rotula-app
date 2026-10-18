import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MembersList, type Member } from "@/components/groups/MembersList";
import { RecentDeposits } from "@/components/groups/RecentDeposits";
import { GroupHeader } from "@/components/groups/GroupHeader";

describe("Decorative Avatars Accessibility (Issue #289)", () => {
  it("does not announce member name twice in MembersList", () => {
    const members: Member[] = [
      {
        id: "m1",
        name: "Ada Lovelace",
        role: "Admin",
        status: "CONTRIBUTED",
        avatarUrl: "https://example.com/ada.jpg",
      },
      {
        id: "m2",
        name: "Grace Hopper",
        role: "Member",
        status: "WAITING",
      },
    ];

    render(<MembersList members={members} onInvite={vi.fn()} />);

    // Avatar image should be decorative (alt="") and NOT exposed as an accessible image named "Ada Lovelace"
    expect(
      screen.queryByRole("img", { name: "Ada Lovelace" }),
    ).not.toBeInTheDocument();

    // Member name is rendered once as visible text
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    // Fallback initial for Grace Hopper is aria-hidden so it doesn't stutter before the name
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    const initial = screen.getByText("G");
    expect(initial).toHaveAttribute("aria-hidden", "true");
  });

  it("does not announce depositor name twice in RecentDeposits", () => {
    const deposits = [
      {
        id: "d1",
        name: "Kofi Mensah",
        time: "10 mins ago",
        amount: 50000,
        avatarUrl: "https://example.com/kofi.jpg",
      },
      {
        id: "d2",
        name: "Yaa Asantewaa",
        time: "1 hour ago",
        amount: 20000,
      },
    ];

    render(<RecentDeposits deposits={deposits} />);

    // Avatar image is decorative (alt="") and not exposed as an image with name
    expect(
      screen.queryByRole("img", { name: "Kofi Mensah" }),
    ).not.toBeInTheDocument();

    // Visible text renders name
    expect(screen.getByText("Kofi Mensah")).toBeInTheDocument();

    // Fallback initial is aria-hidden
    const initial = screen.getByText("Y");
    expect(initial).toHaveAttribute("aria-hidden", "true");
  });

  it('renders decorative avatar stack with alt="" in GroupHeader', () => {
    const { container } = render(
      <GroupHeader
        title="Lagos Savers"
        totalSavings={150000}
        activeMembers={8}
      />,
    );

    // No repetitive "‹group› member X" image announcements
    expect(
      screen.queryByRole("img", { name: /member/i }),
    ).not.toBeInTheDocument();

    // Images in the stack have alt=""
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      expect(img.getAttribute("alt")).toBe("");
    });

    // Active members text is clearly readable
    expect(screen.getByText("8 Members Active")).toBeInTheDocument();
  });
});
