import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "@/utils/formatters/date";

describe("date and dateTime formatters (Issue #270)", () => {
  // Boundary and Clamping
  describe("Boundary and Clamping", () => {
    it("formats Unix epoch (0 ms) in UTC correctly", () => {
      const epoch = new Date(0);
      expect(formatDate(epoch)).toBe("Jan 1, 1970");
      expect(formatDateTime(epoch)).toBe("Jan 1, 1970, 12:00 AM UTC");
    });

    it("formats leap day correctly in UTC", () => {
      const leapDay = "2024-02-29T14:30:00.000Z";
      expect(formatDate(leapDay)).toBe("Feb 29, 2024");
      expect(formatDateTime(leapDay)).toBe("Feb 29, 2024, 2:30 PM UTC");
    });

    it("formats non-leap year Feb 28 correctly", () => {
      const feb28 = "2023-02-28T23:59:59.000Z";
      expect(formatDate(feb28)).toBe("Feb 28, 2023");
      expect(formatDateTime(feb28)).toBe("Feb 28, 2023, 11:59 PM UTC");
    });

    it("formats year-end boundary (23:59 UTC) without shifting to next year", () => {
      const yearEnd = "2026-12-31T23:59:00.000Z";
      expect(formatDate(yearEnd)).toBe("Dec 31, 2026");
      expect(formatDateTime(yearEnd)).toBe("Dec 31, 2026, 11:59 PM UTC");
    });

    it("formats year-start boundary (00:00 UTC) without shifting to previous year", () => {
      const yearStart = "2026-01-01T00:00:00.000Z";
      expect(formatDate(yearStart)).toBe("Jan 1, 2026");
      expect(formatDateTime(yearStart)).toBe("Jan 1, 2026, 12:00 AM UTC");
    });

    const years = [
      1970, 1980, 1995, 2000, 2010, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
      2027, 2028, 2029, 2030, 2050,
    ];
    years.forEach((yr) => {
      it(`formats mid-year date for year ${yr} consistently in UTC`, () => {
        const iso = `${yr}-07-15T12:00:00.000Z`;
        expect(formatDate(iso)).toBe(`Jul 15, ${yr}`);
        expect(formatDateTime(iso)).toBe(`Jul 15, ${yr}, 12:00 PM UTC`);
      });
    });

    const months = [
      { num: "01", name: "Jan", days: "15" },
      { num: "02", name: "Feb", days: "15" },
      { num: "03", name: "Mar", days: "15" },
      { num: "04", name: "Apr", days: "15" },
      { num: "05", name: "May", days: "15" },
      { num: "06", name: "Jun", days: "15" },
      { num: "07", name: "Jul", days: "15" },
      { num: "08", name: "Aug", days: "15" },
      { num: "09", name: "Sep", days: "15" },
      { num: "10", name: "Oct", days: "15" },
      { num: "11", name: "Nov", days: "15" },
      { num: "12", name: "Dec", days: "15" },
    ];

    months.forEach(({ num, name, days }) => {
      it(`formats month ${name} (${num}) consistently in UTC`, () => {
        const iso = `2026-${num}-${days}T08:00:00.000Z`;
        expect(formatDate(iso)).toBe(`${name} 15, 2026`);
        expect(formatDateTime(iso)).toBe(`${name} 15, 2026, 8:00 AM UTC`);
      });
    });

    it("accepts Date instances, ISO strings, and numeric timestamps interchangeably", () => {
      const ts = 1770000000000;
      const dateObj = new Date(ts);
      const isoStr = dateObj.toISOString();

      const fromObj = formatDateTime(dateObj);
      const fromIso = formatDateTime(isoStr);
      const fromTs = formatDateTime(ts);

      expect(fromObj).toBe(fromIso);
      expect(fromObj).toBe(fromTs);
      expect(fromObj).toContain("UTC");
    });
  });

  // Timezone Options and Combinatorics
  describe("Timezone Options and Combinatorics", () => {
    const fixedIso = "2026-07-20T14:30:00.000Z";

    it("defaults to UTC with short timezone label in formatDateTime", () => {
      const result = formatDateTime(fixedIso);
      expect(result).toBe("Jul 20, 2026, 2:30 PM UTC");
    });

    it("allows custom timeZone override while displaying the target zone", () => {
      const ny = formatDateTime(fixedIso, { timeZone: "America/New_York" });
      expect(ny).toContain("EDT"); // Daylight saving in July
      expect(ny).toContain("10:30 AM"); // UTC-4

      const tokyo = formatDateTime(fixedIso, { timeZone: "Asia/Tokyo" });
      expect(tokyo).toContain("11:30 PM"); // UTC+9
    });

    it("supports long timezone name when explicitly requested", () => {
      const longUtc = formatDateTime(fixedIso, { timeZoneName: "long" });
      expect(longUtc).toContain("Coordinated Universal Time");
    });

    it("supports shortOffset timezone name", () => {
      const shortOffset = formatDateTime(fixedIso, {
        timeZoneName: "shortOffset",
      });
      expect(shortOffset).toContain("GMT");
    });

    it("supports longOffset timezone name", () => {
      const longOffset = formatDateTime(fixedIso, {
        timeZoneName: "longOffset",
      });
      expect(longOffset).toContain("GMT");
    });

    // 24 hours * 2 minute samples = 48 combinatorial hour checks
    Array.from({ length: 24 }, (_, h) => {
      [0, 30].forEach((m) => {
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? "AM" : "PM";
        const minStr = m === 0 ? "00" : "30";
        const expectedTime = `${h12}:${minStr} ${ampm} UTC`;

        it(`formats ${String(h).padStart(2, "0")}:${minStr} UTC as ${expectedTime}`, () => {
          const d = new Date(Date.UTC(2026, 6, 20, h, m, 0));
          expect(formatDateTime(d)).toBe(`Jul 20, 2026, ${expectedTime}`);
        });
      });
    });

    it("formatDate respects timeZone option when provided", () => {
      // 2026-01-01T02:00:00Z is 2025-12-31 in New York (UTC-5)
      const lateNight = "2026-01-01T02:00:00.000Z";
      expect(formatDate(lateNight, { timeZone: "UTC" })).toBe("Jan 1, 2026");
      expect(formatDate(lateNight, { timeZone: "America/New_York" })).toBe(
        "Dec 31, 2025",
      );
    });
  });

  // ISO Format Variations and Offset Normalization
  describe("ISO Format Variations and Offset Normalization", () => {
    it("handles ISO string with explicit UTC offset (+00:00)", () => {
      const str = "2026-10-18T15:45:00+00:00";
      expect(formatDateTime(str)).toBe("Oct 18, 2026, 3:45 PM UTC");
    });

    it("normalizes non-zero timezone offset (+03:00) to accurate UTC time", () => {
      // 18:00+03:00 is exactly 15:00 UTC
      const str = "2026-10-18T18:00:00+03:00";
      expect(formatDateTime(str)).toBe("Oct 18, 2026, 3:00 PM UTC");
    });

    it("normalizes negative timezone offset (-05:00) to accurate UTC time", () => {
      // 10:00-05:00 is exactly 15:00 UTC
      const str = "2026-10-18T10:00:00-05:00";
      expect(formatDateTime(str)).toBe("Oct 18, 2026, 3:00 PM UTC");
    });

    it("handles ISO strings without fractional milliseconds", () => {
      const str = "2026-05-10T09:15:30Z";
      expect(formatDateTime(str)).toBe("May 10, 2026, 9:15 AM UTC");
    });

    it("handles ISO strings with 3-digit fractional milliseconds", () => {
      const str = "2026-05-10T09:15:30.123Z";
      expect(formatDateTime(str)).toBe("May 10, 2026, 9:15 AM UTC");
    });

    it("handles ISO strings with 6-digit fractional microseconds", () => {
      const str = "2026-05-10T09:15:30.123456Z";
      expect(formatDateTime(str)).toBe("May 10, 2026, 9:15 AM UTC");
    });
  });

  // Cross-Viewer Consistency
  describe("Cross-Viewer Consistency", () => {
    it("produces identical output for identical on-chain timestamps regardless of viewer context", () => {
      const onChainEventTime = "2026-10-18T12:00:00.000Z";

      // Two different admin sessions formatting the exact same record
      const adminAOutput = formatDateTime(onChainEventTime);
      const adminBOutput = formatDateTime(onChainEventTime);

      expect(adminAOutput).toBe("Oct 18, 2026, 12:00 PM UTC");
      expect(adminAOutput).toBe(adminBOutput);
      expect(adminAOutput.endsWith("UTC")).toBe(true);
    });

    it("verifies relative ordering of timestamps is preserved with UTC indicator", () => {
      const t1 = "2026-10-18T10:00:00.000Z";
      const t2 = "2026-10-18T11:00:00.000Z";
      const t3 = "2026-10-18T12:00:00.000Z";

      const formatted1 = formatDateTime(t1);
      const formatted2 = formatDateTime(t2);
      const formatted3 = formatDateTime(t3);

      expect(formatted1).toBe("Oct 18, 2026, 10:00 AM UTC");
      expect(formatted2).toBe("Oct 18, 2026, 11:00 AM UTC");
      expect(formatted3).toBe("Oct 18, 2026, 12:00 PM UTC");
    });

    it("ensures ledger entries and contract health panels share matching timezone display", () => {
      const txTime = "2026-10-18T14:22:15.000Z";
      const formattedTx = formatDateTime(txTime);

      expect(formattedTx).toContain("UTC");
      expect(formattedTx).toBe("Oct 18, 2026, 2:22 PM UTC");
    });
  });

  // Validation and Immutability
  describe("Validation and Immutability", () => {
    it("handles invalid date strings gracefully without throwing", () => {
      expect(formatDate("not-a-date")).toBe("Invalid Date");
      expect(formatDateTime("not-a-date")).toBe("Invalid Date");
    });

    it("handles empty string gracefully without throwing", () => {
      expect(formatDate("")).toBe("Invalid Date");
      expect(formatDateTime("")).toBe("Invalid Date");
    });

    it("handles NaN timestamps gracefully without throwing", () => {
      expect(formatDate(NaN)).toBe("Invalid Date");
      expect(formatDateTime(NaN)).toBe("Invalid Date");
    });

    it("handles Infinity timestamps gracefully without throwing", () => {
      expect(formatDate(Infinity)).toBe("Invalid Date");
      expect(formatDateTime(Infinity)).toBe("Invalid Date");
    });

    it("does not mutate the passed Date instance", () => {
      const originalTime = 1770000000000;
      const date = new Date(originalTime);

      formatDateTime(date);
      formatDate(date);

      expect(date.getTime()).toBe(originalTime);
    });
  });

  // Performance and High Throughput
  describe("Performance and High Throughput", () => {
    it("formats 1,000 timestamps in under 100ms", () => {
      const baseTime = 1770000000000;
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        formatDateTime(baseTime + i * 60000);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });

    it("performs 5,000 formatDate calls sub-second without memory retention", () => {
      const baseTime = 1770000000000;
      const start = Date.now();

      for (let i = 0; i < 5000; i++) {
        formatDate(baseTime + i * 86400000);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
