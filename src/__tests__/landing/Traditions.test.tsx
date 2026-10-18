import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Traditions from "@/components/landing/Traditions";
import Home from "@/app/page";

describe("Traditions Component", () => {
  it("renders the community traditions section with all tradition cards", () => {
    const { container } = render(<Traditions />);

    // Section id remains #community
    const section = container.querySelector("section#community");
    expect(section).toBeInTheDocument();

    // Section title
    expect(
      screen.getByRole("heading", {
        name: /saving together is already a technology/i,
      }),
    ).toBeInTheDocument();

    // Renders each tradition
    expect(screen.getByRole("heading", { name: "Ajo" })).toBeInTheDocument();
    expect(screen.getByText("Nigeria")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Esusu" })).toBeInTheDocument();
    expect(screen.getByText("West Africa")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Chama" })).toBeInTheDocument();
    expect(screen.getByText("East Africa")).toBeInTheDocument();
  });

  it("renders Traditions properly on the Home landing page", () => {
    const { container } = render(<Home />);
    expect(container.querySelector("section#community")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ajo" })).toBeInTheDocument();
  });
});
