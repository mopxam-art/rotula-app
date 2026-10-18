import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GroupStats } from "@/components/groups/GroupStats";

describe("GroupStats", () => {
  it("renders singular 'Mo' when streak is 1", () => {
    render(<GroupStats efficiency={95} streak={1} />);

    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("1 Mo")).toBeInTheDocument();
    expect(screen.queryByText("1 Mos")).not.toBeInTheDocument();
  });

  it("renders plural 'Mos' when streak is 2 or greater", () => {
    const { rerender } = render(<GroupStats efficiency={90} streak={2} />);
    expect(screen.getByText("2 Mos")).toBeInTheDocument();

    rerender(<GroupStats efficiency={90} streak={12} />);
    expect(screen.getByText("12 Mos")).toBeInTheDocument();
  });

  it("handles zero streak gracefully as plural '0 Mos'", () => {
    render(<GroupStats efficiency={80} streak={0} />);
    expect(screen.getByText("0 Mos")).toBeInTheDocument();
  });

  it("renders efficiency percentage correctly alongside streak", () => {
    render(<GroupStats efficiency={98} streak={5} />);
    expect(screen.getByText("Efficiency")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("5 Mos")).toBeInTheDocument();
  });
});
