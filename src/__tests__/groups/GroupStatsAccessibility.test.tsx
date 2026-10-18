import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GroupStats } from "@/components/groups/GroupStats";
import { HelpCard } from "@/components/groups/HelpCard";

describe("GroupStats and Group Components Decorative Icons Accessibility", () => {
  it("renders stat metrics and ensures decorative TrendingUp and Clock icons are aria-hidden", () => {
    const { container } = render(<GroupStats efficiency={94.5} streak={6} />);

    // Renders data
    expect(screen.getByText("Efficiency")).toBeInTheDocument();
    expect(screen.getByText("94.5%")).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("6 Mos")).toBeInTheDocument();

    // Verify SVGs in GroupStats have aria-hidden="true"
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    // Ensure no unlabelled images or graphics are announced
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("ensures decorative icon in HelpCard is aria-hidden", () => {
    const { container } = render(<HelpCard />);
    const button = screen.getByRole("button", { name: /open whatsapp/i });
    expect(button).toBeInTheDocument();

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
