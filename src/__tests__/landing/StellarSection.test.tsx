import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StellarSection from "@/components/landing/StellarSection";

describe("StellarSection Component", () => {
  it("renders all architecture layers as informative presentational rows without misleading navigation chevrons", () => {
    const { container } = render(<StellarSection />);

    // Renders section
    const section = container.querySelector("section#stellar");
    expect(section).toBeInTheDocument();

    // Renders headings and descriptions
    expect(
      screen.getByRole("heading", { name: "A clear role for every layer." }),
    ).toBeInTheDocument();

    // Renders each layer title
    expect(
      screen.getByRole("heading", { name: "WhatsApp" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Kolo backend" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Stellar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Soroban" }),
    ).toBeInTheDocument();

    // Ensure no chevron navigation SVGs (path d="m9 18 6-6-6-6") are rendered inside layer rows
    const chevronPaths = container.querySelectorAll('path[d="m9 18 6-6-6-6"]');
    expect(chevronPaths.length).toBe(0);

    // The genuine external contract link remains present and accessible
    const contractLink = screen.getByRole("link", {
      name: /explore the soroban contracts/i,
    });
    expect(contractLink).toBeInTheDocument();
    expect(contractLink).toHaveAttribute(
      "href",
      "https://github.com/Stellar-Kolo/kolo-contracts",
    );
  });
});
