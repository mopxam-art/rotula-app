import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RecentDeposits } from "@/components/groups/RecentDeposits";

describe("RecentDeposits", () => {
  const mockDeposits = [
    {
      id: "d1",
      name: "Amara Okonkwo",
      time: "2 hours ago",
      amount: 15000,
      avatarUrl: "https://example.com/avatar1.jpg",
      isCurrentUser: true,
    },
    {
      id: "d2",
      name: "Tunde Bakare",
      time: "Yesterday",
      amount: 25000,
    },
  ];

  it("renders an explicit empty state when deposits array is empty", () => {
    render(<RecentDeposits deposits={[]} />);

    // Heading remains so the section is identifiable
    expect(
      screen.getByRole("heading", { level: 3, name: /recent deposits/i }),
    ).toBeInTheDocument();

    // Empty state message is rendered and accessible
    expect(screen.getByText("No deposits yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        /contributions will appear here once members start depositing/i,
      ),
    ).toBeInTheDocument();

    // No deposit rows or amounts rendered
    expect(screen.queryByText("+₦")).not.toBeInTheDocument();
  });

  it("renders populated deposit list with names, times, amounts, and initials/avatars", () => {
    render(<RecentDeposits deposits={mockDeposits} />);

    // Heading remains
    expect(
      screen.getByRole("heading", { level: 3, name: /recent deposits/i }),
    ).toBeInTheDocument();

    // Empty state is not rendered
    expect(screen.queryByText("No deposits yet")).not.toBeInTheDocument();

    // Members and details
    expect(screen.getByText("Amara Okonkwo")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("+₦15,000")).toBeInTheDocument();

    expect(screen.getByText("Tunde Bakare")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("+₦25,000")).toBeInTheDocument();

    // Fallback initial
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
