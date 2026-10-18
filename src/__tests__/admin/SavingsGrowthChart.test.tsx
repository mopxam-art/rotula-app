import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SavingsGrowthChart } from "@/components/admin/charts/SavingsGrowthChart";

describe("SavingsGrowthChart", () => {
  const dummyData = [
    { label: "Jan", value: 1000 },
    { label: "Feb", value: 2500 },
    { label: "Mar", value: 12500 },
  ];

  it("renders without crashing with provided data points", () => {
    const { container } = render(<SavingsGrowthChart data={dummyData} />);
    expect(container).toBeDefined();
  });
});
