import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Navbar from "@/components/landing/Navbar";

describe("Navbar Component - Mobile Menu Accessibility", () => {
  it("initializes with mobile menu closed and aria-expanded=false", () => {
    render(<Navbar />);
    const toggleButton = screen.getByRole("button", {
      name: /open navigation/i,
    });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Explore the project ↗")).toBeNull();
  });

  it("opens mobile menu and updates aria-expanded=true when toggle clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggleButton = screen.getByRole("button", {
      name: /open navigation/i,
    });

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(toggleButton).toHaveAttribute("aria-label", "Close navigation");
    expect(screen.getByText("Explore the project ↗")).toBeInTheDocument();
  });

  it("closes the mobile menu and returns focus to the toggle button when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggleButton = screen.getByRole("button", {
      name: /open navigation/i,
    });

    // Open menu
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    // Press Escape
    await user.keyboard("{Escape}");

    // Menu should be closed
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(toggleButton).toHaveAttribute("aria-label", "Open navigation");
    expect(screen.queryByText("Explore the project ↗")).toBeNull();

    // Focus returns to the toggle button
    expect(toggleButton).toHaveFocus();
  });

  it("closes the mobile menu when a navigation link inside the menu is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggleButton = screen.getByRole("button", {
      name: /open navigation/i,
    });

    // Open menu
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    // Click a link inside the mobile menu
    const mobileLinks = screen.getAllByRole("link", { name: /how it works/i });
    await user.click(mobileLinks[mobileLinks.length - 1]);

    // Menu should close
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Explore the project ↗")).toBeNull();
  });
});
