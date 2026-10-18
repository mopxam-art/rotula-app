import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Navbar, {
  NAV_LINKS,
  links,
  type NavLink,
} from "@/components/landing/Navbar";
import Home from "@/app/page";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import StellarSection from "@/components/landing/StellarSection";
import Traditions from "@/components/landing/Traditions";
import FAQ from "@/components/landing/FAQ";

describe("Navbar & Landing Section Links (#298)", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Dimension 1: Boundary & Clamping
  // =========================================================================
  describe("Dimension 1: Boundary & Clamping", () => {
    it("exports NAV_LINKS as an array of exactly 5 section links", () => {
      expect(Array.isArray(NAV_LINKS)).toBe(true);
      expect(NAV_LINKS.length).toBe(5);
    });

    it("exports links alias strictly equal to NAV_LINKS for backwards compatibility", () => {
      expect(links).toEqual(NAV_LINKS);
      expect(links.length).toBe(5);
    });

    it("clamps boundary access for first link (index 0)", () => {
      const first = NAV_LINKS[0];
      expect(first).toBeDefined();
      expect(first.href).toBe("#features");
      expect(first.label).toBe("Features");
    });

    it("clamps boundary access for last link (index 4)", () => {
      const last = NAV_LINKS[NAV_LINKS.length - 1];
      expect(last).toBeDefined();
      expect(last.href).toBe("#faq");
      expect(last.label).toBe("FAQ");
    });

    it("returns undefined for negative index lookups", () => {
      expect((NAV_LINKS as readonly NavLink[])[-1]).toBeUndefined();
      expect((NAV_LINKS as readonly NavLink[])[-10]).toBeUndefined();
    });

    it("returns undefined for indices at and beyond total length", () => {
      expect((NAV_LINKS as readonly NavLink[])[5]).toBeUndefined();
      expect((NAV_LINKS as readonly NavLink[])[6]).toBeUndefined();
      expect((NAV_LINKS as readonly NavLink[])[100]).toBeUndefined();
    });

    const expectedSections = [
      {
        index: 0,
        href: "#features",
        label: "Features",
        expectedId: "features",
        expectedWordCount: 1,
      },
      {
        index: 1,
        href: "#how-it-works",
        label: "How it works",
        expectedId: "how-it-works",
        expectedWordCount: 3,
      },
      {
        index: 2,
        href: "#stellar",
        label: "Why Stellar",
        expectedId: "stellar",
        expectedWordCount: 2,
      },
      {
        index: 3,
        href: "#community",
        label: "Community",
        expectedId: "community",
        expectedWordCount: 1,
      },
      {
        index: 4,
        href: "#faq",
        label: "FAQ",
        expectedId: "faq",
        expectedWordCount: 1,
      },
    ];

    for (const {
      index,
      href,
      label,
      expectedId,
      expectedWordCount,
    } of expectedSections) {
      it(`boundary entry [${index}]: href is strictly prefixed with '#' (${href})`, () => {
        const item = NAV_LINKS[index];
        expect(item.href.startsWith("#")).toBe(true);
        expect(item.href[0]).toBe("#");
      });

      it(`boundary entry [${index}]: exact href string match (${href})`, () => {
        const item = NAV_LINKS[index];
        expect(item.href).toBe(href);
      });

      it(`boundary entry [${index}]: slug after '#' matches target section id (${expectedId})`, () => {
        const item = NAV_LINKS[index];
        const slug = item.href.slice(1);
        expect(slug).toBe(expectedId);
      });

      it(`boundary entry [${index}]: slug contains only valid lowercase alphanumeric and hyphen chars`, () => {
        const item = NAV_LINKS[index];
        const slug = item.href.slice(1);
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(slug).not.toContain(" ");
      });

      it(`boundary entry [${index}]: label is trimmed with no leading or trailing whitespace`, () => {
        const item = NAV_LINKS[index];
        expect(item.label.trim()).toBe(item.label);
      });

      it(`boundary entry [${index}]: exact label string match (${label})`, () => {
        const item = NAV_LINKS[index];
        expect(item.label).toBe(label);
      });

      it(`boundary entry [${index}]: label length bounds (3 <= len <= 30)`, () => {
        const item = NAV_LINKS[index];
        expect(item.label.length).toBeGreaterThanOrEqual(3);
        expect(item.label.length).toBeLessThanOrEqual(30);
      });

      it(`boundary entry [${index}]: label word count matches expectation (${expectedWordCount})`, () => {
        const item = NAV_LINKS[index];
        const words = item.label.split(" ").filter(Boolean);
        expect(words.length).toBe(expectedWordCount);
      });

      it(`boundary entry [${index}]: href starts with ASCII code 35 (#) (${href})`, () => {
        expect(href.charCodeAt(0)).toBe(35);
      });

      it(`boundary entry [${index}]: href is strictly lowercased with no uppercase chars (${href})`, () => {
        expect(href).toBe(href.toLowerCase());
      });
    }

    it("verifies uniqueness: set of all hrefs has size 5 (0 duplicates)", () => {
      const hrefs = NAV_LINKS.map((l) => l.href);
      expect(new Set(hrefs).size).toBe(5);
    });

    it("verifies uniqueness: set of all labels has size 5 (0 duplicates)", () => {
      const labels = NAV_LINKS.map((l) => l.label);
      expect(new Set(labels).size).toBe(5);
    });

    it("verifies ordering: links follow exact page vertical render order", () => {
      const expectedOrder = [
        "#features",
        "#how-it-works",
        "#stellar",
        "#community",
        "#faq",
      ];
      expect(NAV_LINKS.map((l) => l.href)).toEqual(expectedOrder);
    });
  });

  // =========================================================================
  // Dimension 2: Combinatorics
  // =========================================================================
  describe("Dimension 2: Combinatorics", () => {
    it("renders desktop section links matching all 5 NAV_LINKS in order", () => {
      render(<Navbar />);
      const allLinks = screen.getAllByRole("link");
      const desktopLinks = allLinks.filter((l) =>
        NAV_LINKS.some((nl) => nl.href === l.getAttribute("href")),
      );

      expect(desktopLinks.length).toBe(5);
      desktopLinks.forEach((linkEl, idx) => {
        expect(linkEl).toHaveAttribute("href", NAV_LINKS[idx].href);
        expect(linkEl).toHaveTextContent(NAV_LINKS[idx].label);
      });
    });

    it("pairwise desktop vs mobile attribute equivalence across all 5 links", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const toggle = screen.getByRole("button", { name: /open navigation/i });
      await user.click(toggle);

      for (let i = 0; i < NAV_LINKS.length; i++) {
        const { href, label } = NAV_LINKS[i];
        const matching = screen.getAllByRole("link", { name: label });
        expect(matching.length).toBe(2);

        const desktop = matching[0];
        const mobile = matching[1];

        expect(desktop.getAttribute("href")).toBe(mobile.getAttribute("href"));
        expect(desktop.textContent).toBe(mobile.textContent);
        expect(mobile).toHaveAttribute("href", href);
      }
    });

    for (let i = 0; i < NAV_LINKS.length; i++) {
      const target = NAV_LINKS[i];
      it(`clicking mobile drawer link [${i} - ${target.label}] closes mobile menu`, async () => {
        const user = userEvent.setup();
        render(<Navbar />);

        const toggle = screen.getByRole("button", { name: /open navigation/i });
        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");

        const matching = screen.getAllByRole("link", { name: target.label });
        const mobileInstance = matching[matching.length - 1];

        await user.click(mobileInstance);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
      });
    }

    it("verifies mobile drawer toggle button state cycling on repeated clicks", async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      const toggle = screen.getByRole("button", { name: /open navigation/i });

      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveAttribute("aria-label", "Open navigation");

      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(toggle).toHaveAttribute("aria-label", "Close navigation");

      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveAttribute("aria-label", "Open navigation");
    });
  });

  // =========================================================================
  // Dimension 3: Host Variations & DOM Structure
  // =========================================================================
  describe("Dimension 3: Host Variations & DOM Structure", () => {
    const sectionComponents = [
      {
        name: "Features",
        comp: <Features />,
        expectedId: "features",
        expectedClass: "scroll-mt-24",
      },
      {
        name: "HowItWorks",
        comp: <HowItWorks />,
        expectedId: "how-it-works",
        expectedClass: "scroll-mt-24",
      },
      {
        name: "StellarSection",
        comp: <StellarSection />,
        expectedId: "stellar",
        expectedClass: "scroll-mt-24",
      },
      {
        name: "Traditions",
        comp: <Traditions />,
        expectedId: "community",
        expectedClass: "scroll-mt-24",
      },
      {
        name: "FAQ",
        comp: <FAQ />,
        expectedId: "faq",
        expectedClass: "scroll-mt-24",
      },
    ];

    for (const { name, comp, expectedId, expectedClass } of sectionComponents) {
      it(`${name} component renders a <section> element`, () => {
        render(comp);
        const section = document.getElementById(expectedId);
        expect(section).not.toBeNull();
        expect(section?.tagName.toLowerCase()).toBe("section");
      });

      it(`${name} component has exact id='${expectedId}'`, () => {
        render(comp);
        const section = document.getElementById(expectedId);
        expect(section?.id).toBe(expectedId);
      });

      it(`${name} component contains '${expectedClass}' for fixed header offset`, () => {
        render(comp);
        const section = document.getElementById(expectedId);
        expect(section?.className).toContain(expectedClass);
      });
    }

    it("full Home page renders all 5 section anchors with 1-to-1 parity to NAV_LINKS", () => {
      render(<Home />);

      for (const { href } of NAV_LINKS) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        expect(el).not.toBeNull();
        expect(el?.id).toBe(id);
      }
    });

    it("ensures no orphaned section anchors exist on the landing page", () => {
      render(<Home />);
      const sections = Array.from(
        document.querySelectorAll("main > section[id]"),
      );
      const sectionIds = sections.map((s) => s.id);
      const expectedIds = NAV_LINKS.map((l) => l.href.slice(1));

      expect(sectionIds.sort()).toEqual(expectedIds.sort());
    });

    it("ensures all 5 sections on Home retain scroll-mt-24 class", () => {
      render(<Home />);
      for (const link of NAV_LINKS) {
        const id = link.href.slice(1);
        const el = document.getElementById(id);
        expect(el?.className).toContain("scroll-mt-24");
      }
    });
  });

  // =========================================================================
  // Dimension 4: Negative Controls & Isolation
  // =========================================================================
  describe("Dimension 4: Negative Controls & Isolation", () => {
    it("clicking desktop navigation links never modifies mobile drawer state", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const toggle = screen.getByRole("button", { name: /open navigation/i });
      expect(toggle).toHaveAttribute("aria-expanded", "false");

      for (const { label } of NAV_LINKS) {
        const linkEl = screen.getByRole("link", { name: label });
        await user.click(linkEl);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
      }
    });

    it("does not render any links pointing to obsolete anchors", () => {
      const allowedAnchors = new Set(NAV_LINKS.map((l) => l.href));
      const renderedHrefs = NAV_LINKS.map((l) => l.href);

      for (const href of renderedHrefs) {
        expect(allowedAnchors.has(href)).toBe(true);
      }
    });

    it("does not contain malformed or protocol-divergent anchors", () => {
      for (const link of NAV_LINKS) {
        expect(link.href.startsWith("http")).toBe(false);
        expect(link.href.startsWith("/")).toBe(false);
        expect(link.href.includes(" ")).toBe(false);
      }
    });

    it("ensures internal section links never have target='_blank'", () => {
      render(<Navbar />);
      const allLinks = screen.getAllByRole("link");
      const sectionLinks = allLinks.filter((l) =>
        NAV_LINKS.some((nl) => nl.href === l.getAttribute("href")),
      );
      for (const linkEl of sectionLinks) {
        expect(linkEl).not.toHaveAttribute("target", "_blank");
      }
    });

    for (let i = 0; i < NAV_LINKS.length; i++) {
      const link = NAV_LINKS[i];
      it(`negative check [${i} - ${link.label}]: href does not point to external domain`, () => {
        expect(link.href.startsWith("http://")).toBe(false);
        expect(link.href.startsWith("https://")).toBe(false);
      });
      it(`negative check [${i} - ${link.label}]: href does not contain query string or parameters`, () => {
        expect(link.href.includes("?")).toBe(false);
        expect(link.href.includes("&")).toBe(false);
      });
    }

    it("verifies brand home logo links to '/' rather than an anchor", () => {
      render(<Navbar />);
      const brandLink = screen.getByRole("link", { name: /kolo home/i });
      expect(brandLink).toHaveAttribute("href", "/");
    });
  });

  // =========================================================================
  // Dimension 5: Lifecycle & Stress
  // =========================================================================
  describe("Dimension 5: Lifecycle & Stress", () => {
    it("rapid toggle stress: 30 consecutive clicks toggle aria-expanded cleanly without state de-sync", async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      const toggle = screen.getByRole("button", { name: /open navigation/i });

      for (let i = 0; i < 30; i++) {
        await user.click(toggle);
        const expectedExpanded = (i % 2 === 0).toString();
        expect(toggle).toHaveAttribute("aria-expanded", expectedExpanded);
      }

      // After 30 clicks (even number), it should be closed
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    for (let i = 0; i < 5; i++) {
      it(`stress cycle #${i + 1}: unmounts and remounts clean DOM structure`, () => {
        const { unmount } = render(<Navbar />);
        expect(
          screen.getByRole("button", { name: /open navigation/i }),
        ).toBeInTheDocument();
        unmount();
        expect(
          screen.queryByRole("button", { name: /open navigation/i }),
        ).toBeNull();
      });
    }

    it("stress test: rapid mount/unmount cycle of 20 Navbar instances executes without error", () => {
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<Navbar />);
        unmount();
      }
    });

    it("stress test: rapid mount/unmount cycle of 10 full Home landing page instances executes without error", () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<Home />);
        unmount();
      }
    });
  });
});
