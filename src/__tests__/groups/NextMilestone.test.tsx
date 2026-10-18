import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { NextMilestone } from "@/components/groups/NextMilestone";

describe("NextMilestone", () => {
  const defaultProps = {
    milestoneName: "Education Goal",
    progressPercentage: 50,
    amountLeft: 25000,
    targetPayout: 50000,
    dueDate: "2026-12-31",
    onContribute: vi.fn(),
  };

  const circleRadius = 70;
  const circleCircumference = 2 * Math.PI * circleRadius;

  it("renders in-range progress percentage and strokeDashoffset correctly", () => {
    const { container } = render(
      <NextMilestone {...defaultProps} progressPercentage={50} />,
    );

    expect(screen.getByText("50%")).toBeInTheDocument();

    const progressSvg = container.querySelector("svg[viewBox='0 0 160 160']")!;
    const circles = progressSvg.querySelectorAll("circle");
    expect(circles).toHaveLength(2);

    const progressCircle = circles[1];
    const expectedOffset = circleCircumference - 0.5 * circleCircumference;
    expect(
      Number(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeCloseTo(expectedOffset, 2);
  });

  it("clamps progress above 100 to 100% and does not produce negative offset", () => {
    const { container } = render(
      <NextMilestone {...defaultProps} progressPercentage={140} />,
    );

    // Printed percentage reflects the clamped value
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.queryByText("140%")).not.toBeInTheDocument();

    const progressSvg = container.querySelector("svg[viewBox='0 0 160 160']")!;
    const progressCircle = progressSvg.querySelectorAll("circle")[1];
    // Offset for 100% should be 0 (full ring), not negative
    expect(
      Number(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeCloseTo(0, 2);
  });

  it("clamps negative progress to 0% and renders an empty ring", () => {
    const { container } = render(
      <NextMilestone {...defaultProps} progressPercentage={-25} />,
    );

    // Printed percentage reflects the clamped value
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.queryByText("-25%")).not.toBeInTheDocument();

    const progressSvg = container.querySelector("svg[viewBox='0 0 160 160']")!;
    const progressCircle = progressSvg.querySelectorAll("circle")[1];
    // Offset for 0% should be the entire circumference
    expect(
      Number(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeCloseTo(circleCircumference, 2);
  });

  it("renders milestone details and triggers onContribute when clicked", async () => {
    const onContribute = vi.fn();
    const user = userEvent.setup();

    render(<NextMilestone {...defaultProps} onContribute={onContribute} />);

    expect(
      screen.getByText("Next Milestone: Education Goal"),
    ).toBeInTheDocument();
    expect(screen.getByText("₦25,000 left")).toBeInTheDocument();
    expect(screen.getByText("₦50,000")).toBeInTheDocument();
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();

    const contributeBtn = screen.getByRole("button", {
      name: /contribute now/i,
    });
    await user.click(contributeBtn);

    expect(onContribute).toHaveBeenCalledTimes(1);
  });
});
