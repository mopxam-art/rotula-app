import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "@/components/landing/Hero";
import Home from "@/app/page";

describe("Hero Component Accessibility", () => {
  it("renders the main page heading as h1 and does not expose illustration text as a heading", () => {
    render(<Hero />);

    // 1. Assert exactly one heading exists in Hero, and it is the h1
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Ajo, Esusu, Chama/i);

    // 2. Assert 'The Sunday Circle' is NOT a heading
    const sundayHeading = screen.queryByRole("heading", {
      name: /The Sunday Circle/i,
    });
    expect(sundayHeading).toBeNull();

    // 3. Assert 'The Sunday Circle' is still rendered as illustrative content
    const sundayText = screen.getByText("The Sunday Circle");
    expect(sundayText).toBeInTheDocument();
    expect(sundayText.tagName).toBe("P");

    // 4. Assert the concept panel retains its accessible description
    const illustration = screen.getByLabelText(
      "Concept illustration of a Kolo savings group and Stellar ledger",
    );
    expect(illustration).toBeInTheDocument();
    expect(illustration).toContainElement(sundayText);
  });

  it("maintains correct document heading order with h1 followed by section h2s without illustration interference", () => {
    render(<Home />);

    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(1);

    // First heading is the Hero h1
    expect(headings[0].tagName).toBe("H1");
    expect(headings[0]).toHaveTextContent(/Ajo, Esusu, Chama/i);

    // The immediately following section heading is the Features h2 (not an illustration h2)
    expect(headings[1].tagName).toBe("H2");
    expect(headings[1]).toHaveTextContent(
      /Community-led saving, with Stellar underneath/i,
    );

    // No heading anywhere in the document contains "The Sunday Circle"
    const sundayHeading = screen.queryByRole("heading", {
      name: /The Sunday Circle/i,
    });
    expect(sundayHeading).toBeNull();
  });
});
