import { describe, expect, it } from "vitest";
import { formatCompactNumber, formatNumber } from "./number";

describe("number formatters", () => {
  describe("formatNumber", () => {
    it("formats integers with thousands grouping separators", () => {
      expect(formatNumber(1204)).toBe("1,204");
      expect(formatNumber(1249)).toBe("1,249");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("formatCompactNumber", () => {
    it("formats numbers compactly for tight axis displays", () => {
      expect(formatCompactNumber(12500)).toBe("12.5K");
      expect(formatCompactNumber(1000000)).toBe("1M");
      expect(formatCompactNumber(0)).toBe("0");
    });
  });
});
