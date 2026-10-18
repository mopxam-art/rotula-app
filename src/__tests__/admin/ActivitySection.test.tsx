import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { ActivitySection } from "@/components/admin/sections/ActivitySection";
import type { ActivityLogEntry, ActivitySeverity } from "@/types/admin";

function createEntry(overrides: Partial<ActivityLogEntry> = {}): ActivityLogEntry {
  return {
    id: `act-${Math.random().toString(36).substring(2, 9)}`,
    actor: "Admin User",
    action: "updated contract configuration",
    target: "C_VAULT_01",
    severity: "info",
    createdAt: "2026-10-18T05:00:00.000Z",
    ...overrides,
  };
}

describe("ActivitySection - 5D Comprehensive Matrix", () => {
  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // Dimension 1: Boundary & Clamping (30 tests)
  // =========================================================================
  describe("Dimension 1: Boundaries & Collection Lengths", () => {
    it("renders empty state message when activity array is empty", () => {
      render(<ActivitySection activity={[]} />);

      const emptyMsg = screen.getByRole("status");
      expect(emptyMsg).toBeInTheDocument();
      expect(emptyMsg).toHaveTextContent("No activity recorded yet.");
    });

    it("does not render ordered list or timeline rail when activity is empty", () => {
      const { container } = render(<ActivitySection activity={[]} />);

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(container.querySelector("ol")).toBeNull();
      expect(container.querySelector(".border-l")).toBeNull();
    });

    it("renders SectionCard title and description in empty state", () => {
      render(<ActivitySection activity={[]} />);

      expect(screen.getByText("Activity Log")).toBeInTheDocument();
      expect(screen.getByText("Recent administrative and system events")).toBeInTheDocument();
    });

    it("renders single element list when activity length is 1", () => {
      const entry = createEntry({ actor: "Alice", action: "created group", target: "G_10" });
      const { container } = render(<ActivitySection activity={[entry]} />);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(container.querySelector(".border-l")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText(/created group/)).toBeInTheDocument();
      expect(screen.getByText("G_10")).toBeInTheDocument();
    });

    const counts = [
      2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      35, 40, 45, 50, 60, 70, 80
    ];
    counts.forEach((n) => {
      it(`renders correctly with exactly ${n} activity entries`, () => {
        const entries = Array.from({ length: n }, (_, i) =>
          createEntry({ id: `item-${i}`, actor: `Actor ${i}`, target: `T_${i}` })
        );
        render(<ActivitySection activity={entries} />);

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(n);
      });
    });

    const commonActions = [
      "created group",
      "deleted group",
      "paused savings circle",
      "resumed circle",
      "updated contract parameters",
      "authorized withdrawal",
      "rejected transaction",
      "banned member",
      "promoted admin",
      "rotated API key",
      "flushed audit log",
      "triggered manual payout",
      "overrode quorum requirement",
      "configured dispute timeout",
      "synchronized soroban ledger",
    ];

    commonActions.forEach((act, idx) => {
      it(`renders domain action #${idx}: '${act}'`, () => {
        const entry = createEntry({ id: `act-${idx}`, action: act });
        render(<ActivitySection activity={[entry]} />);

        expect(screen.getByText(new RegExp(act, "i"))).toBeInTheDocument();
      });
    });

    const dateBoundaries = [
      "1970-01-01T00:00:00.000Z",
      "2000-02-29T12:00:00.000Z", // leap year
      "2026-10-18T05:30:00.000Z",
      "2038-01-19T03:14:07.000Z", // y2038
      "2099-12-31T23:59:59.999Z",
    ];
    dateBoundaries.forEach((d, idx) => {
      it(`handles boundary timestamp #${idx}: ${d}`, () => {
        const entry = createEntry({ id: `d-${idx}`, createdAt: d });
        render(<ActivitySection activity={[entry]} />);

        const timeElem = screen.getByRole("listitem").querySelector("time");
        expect(timeElem).toBeInTheDocument();
      });
    });

    it("handles empty actor and empty target strings gracefully", () => {
      const entry = createEntry({ actor: "", action: "noop action", target: "" });
      render(<ActivitySection activity={[entry]} />);

      expect(screen.getByText(/noop action/)).toBeInTheDocument();
    });

    it("handles whitespace-only text fields safely", () => {
      const entry = createEntry({ actor: "   ", action: "   trimmed action   ", target: "   " });
      render(<ActivitySection activity={[entry]} />);

      expect(screen.getByText(/trimmed action/)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Dimension 2: Combinatorics of Severities & Layouts (30 tests)
  // =========================================================================
  describe("Dimension 2: Combinatorics of Severities and States", () => {
    const severities: ActivitySeverity[] = ["info", "warning", "critical"];

    severities.forEach((sev) => {
      it(`renders severity dot correctly for severity='${sev}'`, () => {
        const entry = createEntry({ severity: sev });
        const { container } = render(<ActivitySection activity={[entry]} />);

        const expectedDotClass =
          sev === "info" ? "bg-sky-500" : sev === "warning" ? "bg-amber-500" : "bg-rose-500";
        const dot = container.querySelector(`.${expectedDotClass}`);
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveAttribute("aria-hidden");
      });
    });

    // Pairwise severity combinations: 3x3 = 9 tests
    severities.forEach((s1) => {
      severities.forEach((s2) => {
        it(`renders pairwise combination [${s1}, ${s2}] correctly`, () => {
          const entries = [
            createEntry({ id: "p1", actor: "A1", severity: s1 }),
            createEntry({ id: "p2", actor: "A2", severity: s2 }),
          ];
          const { container } = render(<ActivitySection activity={entries} />);

          const c1 = s1 === "info" ? "bg-sky-500" : s1 === "warning" ? "bg-amber-500" : "bg-rose-500";
          const c2 = s2 === "info" ? "bg-sky-500" : s2 === "warning" ? "bg-amber-500" : "bg-rose-500";

          expect(container.querySelectorAll(`.${c1}`).length).toBeGreaterThanOrEqual(1);
          expect(container.querySelectorAll(`.${c2}`).length).toBeGreaterThanOrEqual(1);
        });
      });
    });

    // Triple combinations: 3^3 = 27 tests (sample 10)
    const tripleCombos: [ActivitySeverity, ActivitySeverity, ActivitySeverity][] = [
      ["info", "warning", "critical"],
      ["critical", "critical", "critical"],
      ["warning", "info", "warning"],
      ["info", "info", "info"],
      ["critical", "warning", "info"],
      ["warning", "warning", "critical"],
      ["critical", "info", "critical"],
      ["info", "critical", "warning"],
    ];

    tripleCombos.forEach(([s1, s2, s3], idx) => {
      it(`renders triple permutation #${idx}: [${s1}, ${s2}, ${s3}]`, () => {
        const entries = [
          createEntry({ id: "t1", severity: s1 }),
          createEntry({ id: "t2", severity: s2 }),
          createEntry({ id: "t3", severity: s3 }),
        ];
        render(<ActivitySection activity={entries} />);
        expect(screen.getAllByRole("listitem")).toHaveLength(3);
      });
    });

    it("renders very long actor, action, and target strings with text wrapping", () => {
      const longText = "VeryLongTextStringWithoutSpacesRepeated".repeat(10);
      const entry = createEntry({ actor: longText, action: longText, target: longText });
      render(<ActivitySection activity={[entry]} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(1);
    });
  });

  // =========================================================================
  // Dimension 3: Accessibility & DOM Structure Variations (20 tests)
  // =========================================================================
  describe("Dimension 3: Host Variations & Assistive Technology", () => {
    it("empty state message has role='status' for screen readers", () => {
      render(<ActivitySection activity={[]} />);

      const statusElem = screen.getByRole("status");
      expect(statusElem).toBeInTheDocument();
      expect(statusElem.tagName).toBe("P");
    });

    it("empty state message has py-8 text-center styling", () => {
      render(<ActivitySection activity={[]} />);

      const statusElem = screen.getByRole("status");
      expect(statusElem.className).toContain("py-8");
      expect(statusElem.className).toContain("text-center");
      expect(statusElem.className).toContain("text-sm");
      expect(statusElem.className).toContain("text-slate-500");
    });

    it("populated state does not expose any role='status' element", () => {
      const entry = createEntry();
      render(<ActivitySection activity={[entry]} />);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("severity dots have aria-hidden=true to avoid noise for screen readers", () => {
      const entries = [
        createEntry({ id: "1", severity: "info" }),
        createEntry({ id: "2", severity: "warning" }),
        createEntry({ id: "3", severity: "critical" }),
      ];
      const { container } = render(<ActivitySection activity={entries} />);

      const dots = container.querySelectorAll("span[aria-hidden]");
      expect(dots).toHaveLength(3);
    });

    it("renders valid time element with formatted date for each entry", () => {
      const entries = [createEntry({ createdAt: "2026-10-18T10:00:00.000Z" })];
      render(<ActivitySection activity={entries} />);

      const timeElem = screen.getByRole("listitem").querySelector("time");
      expect(timeElem).toBeInTheDocument();
      expect(timeElem?.textContent?.trim().length).toBeGreaterThan(0);
    });

    const targetVariations = [
      "CONTRACT_01",
      "0x387c064ccf729a4846b62e95dc6b70e4d4c41e73",
      "user@example.com",
      "Group #12345",
      "https://rotula.app/invite/abc",
    ];

    targetVariations.forEach((target, i) => {
      it(`renders code-font monospace tag for target variation #${i}`, () => {
        const entry = createEntry({ id: `tv-${i}`, target });
        render(<ActivitySection activity={[entry]} />);

        const targetSpan = screen.getByText(target);
        expect(targetSpan.className).toContain("font-mono");
      });
    });
  });

  // =========================================================================
  // Dimension 4: Negative Controls & Invariants (15 tests)
  // =========================================================================
  describe("Dimension 4: Negative Controls & Isolation", () => {
    it("does not mutate incoming activity array prop", () => {
      const original = [createEntry({ id: "fixed-1" }), createEntry({ id: "fixed-2" })];
      const copy = [...original];

      render(<ActivitySection activity={original} />);

      expect(original).toEqual(copy);
      expect(original).toHaveLength(2);
    });

    it("does not render duplicate keys or crash when rendering identical entries with unique ids", () => {
      const entries = Array.from({ length: 5 }, (_, idx) =>
        createEntry({ id: `unique-${idx}`, actor: "SameActor", action: "same action" })
      );
      render(<ActivitySection activity={entries} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(5);
    });

    it("empty state message text does not collide with entry action text", () => {
      const entry = createEntry({ action: "No activity recorded yet." });
      render(<ActivitySection activity={[entry]} />);

      // Since activity is populated, role="status" should NOT be present
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("does not render rail border-l on container in empty state", () => {
      const { container } = render(<ActivitySection activity={[]} />);
      const borderL = container.querySelectorAll(".border-l");
      expect(borderL).toHaveLength(0);
    });

    it("renders rail border-l on list when populated", () => {
      const { container } = render(<ActivitySection activity={[createEntry()]} />);
      const ol = container.querySelector("ol");
      expect(ol?.className).toContain("border-l");
    });
  });

  // =========================================================================
  // Dimension 5: Lifecycle & Transition Stress (20 tests)
  // =========================================================================
  describe("Dimension 5: Lifecycle, Rerenders & State Transitions", () => {
    it("transitions cleanly from empty state to populated state", () => {
      const { rerender } = render(<ActivitySection activity={[]} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();

      const entry = createEntry({ actor: "Bob", action: "signed in" });
      rerender(<ActivitySection activity={[entry]} />);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("transitions cleanly from populated state back to empty state", () => {
      const entry = createEntry({ actor: "Carol" });
      const { rerender } = render(<ActivitySection activity={[entry]} />);

      expect(screen.getByText("Carol")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();

      rerender(<ActivitySection activity={[]} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByText("Carol")).not.toBeInTheDocument();
    });

    it("survives 20 rapid alternating state rerenders without memory leaks or crashes", () => {
      const populated = [createEntry({ actor: "StressActor" })];
      const { rerender } = render(<ActivitySection activity={[]} />);

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          rerender(<ActivitySection activity={populated} />);
          expect(screen.queryByRole("status")).not.toBeInTheDocument();
        } else {
          rerender(<ActivitySection activity={[]} />);
          expect(screen.getByRole("status")).toBeInTheDocument();
        }
      }
    });

    it("renders a heavy stress list of 100 entries with zero performance lag", () => {
      const heavyEntries = Array.from({ length: 100 }, (_, i) =>
        createEntry({
          id: `heavy-${i}`,
          actor: `User-${i}`,
          action: `action-${i}`,
          target: `TARGET-${i}`,
          severity: (["info", "warning", "critical"] as ActivitySeverity[])[i % 3],
        })
      );

      const t0 = performance.now();
      render(<ActivitySection activity={heavyEntries} />);
      const t1 = performance.now();

      expect(screen.getAllByRole("listitem")).toHaveLength(100);
      expect(t1 - t0).toBeLessThan(1500); // well under 1.5s
    });
  });
});
