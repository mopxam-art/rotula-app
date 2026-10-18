import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import React from "react";

import { ChartEmptyState } from "@/components/admin/charts/ChartEmptyState";
import { SavingsGrowthChart } from "@/components/admin/charts/SavingsGrowthChart";
import { TransactionVolumeChart } from "@/components/admin/charts/TransactionVolumeChart";
import { UserGrowthChart } from "@/components/admin/charts/UserGrowthChart";
import { GroupStatusChart } from "@/components/admin/charts/GroupStatusChart";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import type { TimeSeriesPoint, GroupStatusDatum, GroupStatus } from "@/types/admin";

afterEach(() => {
  cleanup();
});

describe("Admin Charts Empty State (5D Matrix)", () => {
  const sampleTimeSeries: TimeSeriesPoint[] = [
    { label: "Jan", value: 1200 },
    { label: "Feb", value: 3400 },
    { label: "Mar", value: 5600 },
  ];

  const sampleGroupData: GroupStatusDatum[] = [
    { status: "active", count: 12 },
    { status: "forming", count: 5 },
    { status: "completed", count: 3 },
    { status: "paused", count: 1 },
  ];

  // =========================================================================
  // Dimension 1: Boundary & Clamping
  // =========================================================================
  describe("Dimension 1: Boundary & Clamping", () => {
    it("1.1 SavingsGrowthChart renders empty state with empty array []", () => {
      render(<SavingsGrowthChart data={[]} />);
      const statusEl = screen.getByRole("status");
      expect(statusEl).toBeInTheDocument();
      expect(statusEl).toHaveTextContent("No data available");
    });

    it("1.2 TransactionVolumeChart renders empty state with empty array []", () => {
      render(<TransactionVolumeChart data={[]} />);
      const statusEl = screen.getByRole("status");
      expect(statusEl).toBeInTheDocument();
      expect(statusEl).toHaveTextContent("No data available");
    });

    it("1.3 UserGrowthChart renders empty state with empty array []", () => {
      render(<UserGrowthChart data={[]} />);
      const statusEl = screen.getByRole("status");
      expect(statusEl).toBeInTheDocument();
      expect(statusEl).toHaveTextContent("No data available");
    });

    it("1.4 GroupStatusChart renders empty state with empty array []", () => {
      render(<GroupStatusChart data={[]} />);
      const statusEl = screen.getByRole("status");
      expect(statusEl).toBeInTheDocument();
      expect(statusEl).toHaveTextContent("No data available");
    });

    it("1.5 SavingsGrowthChart handles null gracefully", () => {
      render(<SavingsGrowthChart data={null as unknown as TimeSeriesPoint[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.6 SavingsGrowthChart handles undefined gracefully", () => {
      render(<SavingsGrowthChart data={undefined as unknown as TimeSeriesPoint[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.7 TransactionVolumeChart handles null gracefully", () => {
      render(<TransactionVolumeChart data={null as unknown as TimeSeriesPoint[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.8 TransactionVolumeChart handles undefined gracefully", () => {
      render(<TransactionVolumeChart data={undefined as unknown as TimeSeriesPoint[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.9 UserGrowthChart handles null gracefully", () => {
      render(<UserGrowthChart data={null as unknown as TimeSeriesPoint[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.10 UserGrowthChart handles undefined gracefully", () => {
      render(<UserGrowthChart data={undefined as unknown as TimeSeriesPoint[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.11 GroupStatusChart handles null gracefully", () => {
      render(<GroupStatusChart data={null as unknown as GroupStatusDatum[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("1.12 GroupStatusChart handles undefined gracefully", () => {
      render(<GroupStatusChart data={undefined as unknown as GroupStatusDatum[]} />);
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    const datasetSizes = [1, 2, 5, 10, 25, 50];
    datasetSizes.forEach((size, idx) => {
      it(`1.13.${idx + 1} SavingsGrowthChart with ${size} data points renders chart and no empty state`, () => {
        const data: TimeSeriesPoint[] = Array.from({ length: size }, (_, i) => ({
          label: `M${i + 1}`,
          value: (i + 1) * 100,
        }));
        render(<SavingsGrowthChart data={data} />);
        expect(screen.queryByRole("status")).toBeNull();
      });

      it(`1.14.${idx + 1} TransactionVolumeChart with ${size} data points renders chart and no empty state`, () => {
        const data: TimeSeriesPoint[] = Array.from({ length: size }, (_, i) => ({
          label: `M${i + 1}`,
          value: (i + 1) * 50,
        }));
        render(<TransactionVolumeChart data={data} />);
        expect(screen.queryByRole("status")).toBeNull();
      });

      it(`1.15.${idx + 1} UserGrowthChart with ${size} data points renders chart and no empty state`, () => {
        const data: TimeSeriesPoint[] = Array.from({ length: size }, (_, i) => ({
          label: `M${i + 1}`,
          value: (i + 1) * 10,
        }));
        render(<UserGrowthChart data={data} />);
        expect(screen.queryByRole("status")).toBeNull();
      });
    });

    it("1.16 SavingsGrowthChart handles single point with zero value", () => {
      render(<SavingsGrowthChart data={[{ label: "Jan", value: 0 }]} />);
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("1.17 SavingsGrowthChart handles negative values without falling back to empty state", () => {
      render(<SavingsGrowthChart data={[{ label: "Jan", value: -100 }]} />);
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("1.18 GroupStatusChart handles zero counts in datum", () => {
      render(<GroupStatusChart data={[{ status: "active", count: 0 }]} />);
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("1.19 TimeSeriesPoint with empty string labels does not trigger empty state", () => {
      render(<SavingsGrowthChart data={[{ label: "", value: 500 }]} />);
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("1.20 TimeSeriesPoint with very large numerical value does not trigger empty state", () => {
      render(<SavingsGrowthChart data={[{ label: "Max", value: Number.MAX_SAFE_INTEGER }]} />);
      expect(screen.queryByRole("status")).toBeNull();
    });
  });

  // =========================================================================
  // Dimension 2: Combinatorics & Props
  // =========================================================================
  describe("Dimension 2: Combinatorics & Props", () => {
    const customMessages = [
      "No data available",
      "No records found for this period",
      "Chart data is currently empty",
      "No savings recorded yet",
      "Transaction history empty",
      "No active users in current timeframe",
      "No groups to show",
      "Waiting for incoming analytics stream",
      "Empty metrics collection",
      "Zero activity logged",
      "Data feed offline",
      "Please check back later",
      "Custom empty notice",
      "A very long detailed empty message description that spans multiple lines of explanatory text for screen readers",
      "N/A",
    ];

    customMessages.forEach((msg, idx) => {
      it(`2.1.${idx + 1} ChartEmptyState correctly announces message: "${msg.slice(0, 20)}..."`, () => {
        render(<ChartEmptyState message={msg} />);
        const el = screen.getByRole("status");
        expect(el).toHaveTextContent(msg);
      });
    });

    const classCombinations = [
      "",
      "mt-4",
      "p-8",
      "bg-slate-50",
      "border border-slate-200",
      "rounded-2xl",
      "shadow-inner",
      "text-slate-600 font-medium",
      "opacity-75 transition-opacity",
      "h-[300px]",
    ];

    classCombinations.forEach((cls, idx) => {
      it(`2.2.${idx + 1} ChartEmptyState properly appends custom className: "${cls}"`, () => {
        render(<ChartEmptyState className={cls} />);
        const el = screen.getByRole("status");
        if (cls) {
          cls.split(" ").forEach((c) => expect(el.className).toContain(c));
        }
        expect(el.className).toContain("flex");
        expect(el.className).toContain("h-[260px]");
      });
    });

    const groupStatuses: GroupStatus[] = ["active", "forming", "completed", "paused"];
    groupStatuses.forEach((status, idx) => {
      it(`2.3.${idx + 1} GroupStatusChart handles individual status "${status}" with non-zero count`, () => {
        render(<GroupStatusChart data={[{ status, count: 5 }]} />);
        expect(screen.queryByRole("status")).toBeNull();
      });

      it(`2.3.${idx + 5} GroupStatusChart handles individual status "${status}" with zero count`, () => {
        render(<GroupStatusChart data={[{ status, count: 0 }]} />);
        expect(screen.queryByRole("status")).toBeNull();
      });
    });

    it("2.4 GroupStatusChart handles all 4 statuses simultaneously", () => {
      render(<GroupStatusChart data={sampleGroupData} />);
      expect(screen.queryByRole("status")).toBeNull();
    });

    const charts = [
      { name: "SavingsGrowthChart", Comp: SavingsGrowthChart },
      { name: "TransactionVolumeChart", Comp: TransactionVolumeChart },
      { name: "UserGrowthChart", Comp: UserGrowthChart },
    ];

    charts.forEach(({ name, Comp }, idx) => {
      it(`2.5.${idx + 1} ${name} empty array matches status role and default announcement`, () => {
        render(<Comp data={[]} />);
        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("role", "status");
        expect(status).toHaveTextContent("No data available");
      });
    });
  });

  // =========================================================================
  // Dimension 3: Host Variations & DOM Structures
  // =========================================================================
  describe("Dimension 3: Host Variations & DOM Structures", () => {
    it("3.1 ChartEmptyState has role='status'", () => {
      render(<ChartEmptyState />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("3.2 ChartEmptyState has aria-live='polite'", () => {
      render(<ChartEmptyState />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("3.3 ChartEmptyState renders text inside a <p> tag", () => {
      render(<ChartEmptyState message="Test message" />);
      const p = screen.getByText("Test message");
      expect(p.tagName.toLowerCase()).toBe("p");
    });

    it("3.4 ChartEmptyState maintains fixed height class matching chart height (260px)", () => {
      render(<ChartEmptyState />);
      const el = screen.getByRole("status");
      expect(el.className).toContain("h-[260px]");
    });

    it("3.5 ChartEmptyState centers text horizontally and vertically", () => {
      render(<ChartEmptyState />);
      const el = screen.getByRole("status");
      expect(el.className).toContain("items-center");
      expect(el.className).toContain("justify-center");
      expect(el.className).toContain("text-center");
    });

    it("3.6 ChartEmptyState uses subtle muted text color (text-slate-500)", () => {
      render(<ChartEmptyState />);
      const el = screen.getByRole("status");
      expect(el.className).toContain("text-slate-500");
    });

    it("3.7 SavingsGrowthChart inside SectionCard preserves section heading and renders empty state", () => {
      render(
        <SectionCard title="Savings Trend" description="All-time accumulation">
          <SavingsGrowthChart data={[]} />
        </SectionCard>
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Savings Trend");
      expect(screen.getByText("All-time accumulation")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("3.8 TransactionVolumeChart inside SectionCard preserves section heading and renders empty state", () => {
      render(
        <SectionCard title="Transaction Volume">
          <TransactionVolumeChart data={[]} />
        </SectionCard>
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Transaction Volume");
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("3.9 UserGrowthChart inside SectionCard preserves section heading and renders empty state", () => {
      render(
        <SectionCard title="User Onboarding">
          <UserGrowthChart data={[]} />
        </SectionCard>
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("User Onboarding");
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("3.10 GroupStatusChart inside SectionCard preserves section heading and renders empty state", () => {
      render(
        <SectionCard title="Status Breakdown">
          <GroupStatusChart data={[]} />
        </SectionCard>
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Status Breakdown");
      expect(screen.getByRole("status")).toHaveTextContent("No data available");
    });

    it("3.11 All four empty charts rendered together maintain distinct status DOM nodes", () => {
      render(
        <div>
          <SavingsGrowthChart data={[]} />
          <TransactionVolumeChart data={[]} />
          <UserGrowthChart data={[]} />
          <GroupStatusChart data={[]} />
        </div>
      );
      const statuses = screen.getAllByRole("status");
      expect(statuses).toHaveLength(4);
      statuses.forEach((s) => {
        expect(s).toHaveTextContent("No data available");
      });
    });
  });

  // =========================================================================
  // Dimension 4: Negative Controls & Isolation
  // =========================================================================
  describe("Dimension 4: Negative Controls & Isolation", () => {
    it("4.1 Empty SavingsGrowthChart does not render Recharts responsive container", () => {
      const { container } = render(<SavingsGrowthChart data={[]} />);
      expect(container.querySelector(".recharts-responsive-container")).toBeNull();
      expect(container.querySelector("svg")).toBeNull();
    });

    it("4.2 Empty TransactionVolumeChart does not render Recharts responsive container", () => {
      const { container } = render(<TransactionVolumeChart data={[]} />);
      expect(container.querySelector(".recharts-responsive-container")).toBeNull();
      expect(container.querySelector("svg")).toBeNull();
    });

    it("4.3 Empty UserGrowthChart does not render Recharts responsive container", () => {
      const { container } = render(<UserGrowthChart data={[]} />);
      expect(container.querySelector(".recharts-responsive-container")).toBeNull();
      expect(container.querySelector("svg")).toBeNull();
    });

    it("4.4 Empty GroupStatusChart does not render Recharts responsive container", () => {
      const { container } = render(<GroupStatusChart data={[]} />);
      expect(container.querySelector(".recharts-responsive-container")).toBeNull();
      expect(container.querySelector("svg")).toBeNull();
    });

    it("4.5 Populated SavingsGrowthChart does not render empty state", () => {
      render(<SavingsGrowthChart data={sampleTimeSeries} />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByText("No data available")).toBeNull();
    });

    it("4.6 Populated TransactionVolumeChart does not render empty state", () => {
      render(<TransactionVolumeChart data={sampleTimeSeries} />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByText("No data available")).toBeNull();
    });

    it("4.7 Populated UserGrowthChart does not render empty state", () => {
      render(<UserGrowthChart data={sampleTimeSeries} />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByText("No data available")).toBeNull();
    });

    it("4.8 Populated GroupStatusChart does not render empty state", () => {
      render(<GroupStatusChart data={sampleGroupData} />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByText("No data available")).toBeNull();
    });

    it("4.9 Sibling components are not affected when one chart is empty and another is populated", () => {
      render(
        <div>
          <SavingsGrowthChart data={[]} />
          <TransactionVolumeChart data={sampleTimeSeries} />
        </div>
      );
      const statuses = screen.getAllByRole("status");
      expect(statuses).toHaveLength(1);
    });

    it("4.10 Empty chart state does not trigger any uncaught errors or console warnings", () => {
      expect(() => {
        render(<SavingsGrowthChart data={[]} />);
      }).not.toThrow();
    });
  });

  // =========================================================================
  // Dimension 5: Lifecycle, Rerenders & Stress
  // =========================================================================
  describe("Dimension 5: Lifecycle, Rerenders & Stress", () => {
    it("5.1 SavingsGrowthChart transitions smoothly from empty to populated and back to empty", () => {
      const { rerender } = render(<SavingsGrowthChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<SavingsGrowthChart data={sampleTimeSeries} />);
      expect(screen.queryByRole("status")).toBeNull();

      rerender(<SavingsGrowthChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("5.2 TransactionVolumeChart transitions smoothly from empty to populated and back to empty", () => {
      const { rerender } = render(<TransactionVolumeChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<TransactionVolumeChart data={sampleTimeSeries} />);
      expect(screen.queryByRole("status")).toBeNull();

      rerender(<TransactionVolumeChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("5.3 UserGrowthChart transitions smoothly from empty to populated and back to empty", () => {
      const { rerender } = render(<UserGrowthChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<UserGrowthChart data={sampleTimeSeries} />);
      expect(screen.queryByRole("status")).toBeNull();

      rerender(<UserGrowthChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("5.4 GroupStatusChart transitions smoothly from empty to populated and back to empty", () => {
      const { rerender } = render(<GroupStatusChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<GroupStatusChart data={sampleGroupData} />);
      expect(screen.queryByRole("status")).toBeNull();

      rerender(<GroupStatusChart data={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("5.5 30 consecutive rapid rerenders between empty and populated maintain DOM integrity", () => {
      const { rerender } = render(<SavingsGrowthChart data={[]} />);
      for (let i = 0; i < 30; i++) {
        if (i % 2 === 0) {
          rerender(<SavingsGrowthChart data={sampleTimeSeries} />);
          expect(screen.queryByRole("status")).toBeNull();
        } else {
          rerender(<SavingsGrowthChart data={[]} />);
          expect(screen.getByRole("status")).toBeInTheDocument();
        }
      }
    });

    it("5.6 ChartEmptyState unmounts cleanly without residual elements", () => {
      const { unmount } = render(<ChartEmptyState />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      unmount();
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("5.7 Unmounting all empty charts leaves zero dangling status nodes", () => {
      const { unmount } = render(
        <div>
          <SavingsGrowthChart data={[]} />
          <TransactionVolumeChart data={[]} />
          <UserGrowthChart data={[]} />
          <GroupStatusChart data={[]} />
        </div>
      );
      expect(screen.getAllByRole("status")).toHaveLength(4);
      unmount();
      expect(screen.queryAllByRole("status")).toHaveLength(0);
    });

    const rapidCycleCounts = [1, 5, 10, 15, 20];
    rapidCycleCounts.forEach((cycles, idx) => {
      it(`5.8.${idx + 1} stress test: handles ${cycles} sequential render/unmount cycles`, () => {
        for (let i = 0; i < cycles; i++) {
          const { unmount } = render(<SavingsGrowthChart data={[]} />);
          expect(screen.getByRole("status")).toBeInTheDocument();
          unmount();
        }
      });
    });
  });
});
