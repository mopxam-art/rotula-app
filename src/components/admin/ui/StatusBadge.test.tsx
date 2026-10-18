import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge, toneFor } from "./StatusBadge";

const NEUTRAL = "bg-slate-50 text-slate-600 ring-slate-500/20";

describe("toneFor", () => {
  it("returns the declared tone for a known status", () => {
    expect(toneFor("active")).toContain("emerald");
  });

  it("matches declared statuses case-insensitively", () => {
    expect(toneFor("PENDING")).toBe(toneFor("pending"));
    expect(toneFor("Active")).toBe(toneFor("active"));
  });

  it("falls back to the neutral tone for a status that was never declared", () => {
    expect(toneFor("something-new")).toBe(NEUTRAL);
    expect(toneFor("")).toBe(NEUTRAL);
  });

  it("never resolves an inherited Object.prototype property", () => {
    for (const status of [
      "constructor",
      "toString",
      "valueOf",
      "hasOwnProperty",
      "__proto__",
      "isPrototypeOf",
    ]) {
      expect(toneFor(status)).toBe(NEUTRAL);
    }
  });
});

describe("StatusBadge", () => {
  it("renders a known status with its semantic tone", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("active").className).toContain("emerald");
  });

  it("renders an undeclared status with the neutral tone", () => {
    render(<StatusBadge status="quarantined" />);
    expect(screen.getByText("quarantined").className).toContain("bg-slate-50");
  });

  it("renders 'constructor' with the neutral tone and not as a function", () => {
    render(<StatusBadge status="constructor" />);
    const el = screen.getByText("constructor");
    expect(el.className).toContain(NEUTRAL);
    expect(el.className).not.toContain("function");
    expect(el.className).not.toContain("native code");
  });

  it("renders 'toString' with the neutral tone and not as a function", () => {
    render(<StatusBadge status="toString" />);
    const el = screen.getByText("toString");
    expect(el.className).toContain(NEUTRAL);
    expect(el.className).not.toContain("function");
  });
});
