import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
} from "./currency";

describe("currency formatters", () => {
  describe("formatCurrency", () => {
    it("formats amounts as standard USD currency", () => {
      expect(formatCurrency(12500)).toBe("$12,500.00");
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("formatCompactNumber", () => {
    it("formats large numbers compactly without currency symbols", () => {
      expect(formatCompactNumber(12500)).toBe("12.5K");
      expect(formatCompactNumber(1000000)).toBe("1M");
      expect(formatCompactNumber(0)).toBe("0");
    });
  });

  describe("formatCompactCurrency", () => {
    it("formats numbers compactly with a currency symbol", () => {
      expect(formatCompactCurrency(12500)).toBe("$12.5K");
      expect(formatCompactCurrency(1000000)).toBe("$1M");
      expect(formatCompactCurrency(0)).toBe("$0");
    });

    it("supports custom currency symbols", () => {
      const formatted = formatCompactCurrency(12500, "EUR");
      expect(formatted).toMatch(/€12\.5K|12\.5K\s?€/);
    });
  });
});
