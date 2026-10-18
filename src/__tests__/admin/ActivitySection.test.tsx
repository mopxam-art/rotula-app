import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivitySection } from "@/components/admin/sections/ActivitySection";
import type { ActivityLogEntry } from "@/types/admin";

describe("ActivitySection", () => {
  const mockActivity: ActivityLogEntry[] = [
    {
      id: "act-1",
      actor: "Alice Admin",
      action: "created group",
      target: "grp_100",
      severity: "info",
      createdAt: "2026-10-18T10:00:00.000Z",
    },
    {
      id: "act-2",
      actor: "Bob Security",
      action: "suspended account",
      target: "usr_200",
      severity: "warning",
      createdAt: "2026-10-18T11:00:00.000Z",
    },
    {
      id: "act-3",
      actor: "System Bot",
      action: "flagged transaction",
      target: "txn_300",
      severity: "critical",
      createdAt: "2026-10-18T12:00:00.000Z",
    },
  ];

  it("renders severity as perceivable text for every log entry", () => {
    render(<ActivitySection activity={mockActivity} />);

    // Assert that each severity level is present as readable text in the document
    expect(screen.getByText("info")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument();
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("ensures colored dot indicators are decorative and aria-hidden", () => {
    const { container } = render(<ActivitySection activity={mockActivity} />);

    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(3);

    listItems.forEach((li, index) => {
      const dot = li.querySelector("span[aria-hidden='true']");
      expect(dot).toBeInTheDocument();

      // Ensure the severity is accessible within this entry without relying on color
      const itemScope = within(li);
      expect(
        itemScope.getByText(mockActivity[index].severity),
      ).toBeInTheDocument();
    });
  });

  it("renders entry details (actor, action, target) alongside severity", () => {
    render(<ActivitySection activity={mockActivity} />);

    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText(/created group/)).toBeInTheDocument();
    expect(screen.getByText("grp_100")).toBeInTheDocument();

    expect(screen.getByText("Bob Security")).toBeInTheDocument();
    expect(screen.getByText(/suspended account/)).toBeInTheDocument();
    expect(screen.getByText("usr_200")).toBeInTheDocument();
  });
});
