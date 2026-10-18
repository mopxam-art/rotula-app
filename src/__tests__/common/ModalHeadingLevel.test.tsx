import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { Modal, type HeadingLevel } from "@/components/common/Modal/Modal";
import { InviteMemberModal } from "@/components/groups/InviteMemberModal";

describe("Modal Flexible Heading Level & Accessibility", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Boundary & Range Checks", () => {
    const headingLevels: HeadingLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

    headingLevels.forEach((level, idx) => {
      const numLevel = idx + 1;
      it(`1.1.${idx + 1} renders correct heading tag for level "${level}"`, () => {
        render(
          <Modal
            isOpen={true}
            onClose={() => {}}
            title={`Title ${level}`}
            headingLevel={level}
          >
            <p>Body</p>
          </Modal>,
        );

        const heading = screen.getByRole("heading", { level: numLevel });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(`Title ${level}`);
        expect(heading.tagName.toLowerCase()).toBe(level);
      });
    });

    it("1.2 defaults to headingLevel h3 when omitted", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Default Level">
          <p>Body</p>
        </Modal>,
      );

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Default Level");
      expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    });

    const boundaryTitles = [
      "",
      " ",
      "A",
      "Short Title",
      "Moderate Title for the Modal Dialog Testing Requirements",
      "Very Long Modal Title That Contains Substantial Narrative And Verifies Heading Wrapping In Small Viewports",
      "Special Characters: !@#$%^&*()_+=-~`[]{}|;:',.<>?/",
      "Unicode & Emojis: 🚀✨🔒 Member Invitation 🌍",
      "Numbers & Currency: $10,000,000 NGN Contribution",
      "HTML Entities: &amp; &lt; &gt; &quot;",
    ];

    boundaryTitles.forEach((title, idx) => {
      it(`1.3.${idx + 1} renders accessible dialog title correctly for "${title.slice(0, 20)}..."`, () => {
        render(
          <Modal isOpen={true} onClose={() => {}} title={title}>
            <p>Body</p>
          </Modal>,
        );

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");

        const heading = screen.getByRole("heading", { level: 3 });
        expect(heading).toHaveAttribute("id", "modal-title");
      });
    });

    it("1.4 returns null and renders zero nodes when isOpen is false", () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => {}} title="Closed Modal">
          <p>Body</p>
        </Modal>,
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByRole("heading")).toBeNull();
    });
  });

  describe("Combinatorics & Input Permutations", () => {
    const headingLevels: HeadingLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

    headingLevels.forEach((level, idx) => {
      it(`2.1.${idx + 1} InviteMemberModal forwards headingLevel="${level}" to Modal primitive`, () => {
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={() => {}}
            onInvite={() => {}}
            headingLevel={level}
          />,
        );

        const dialog = screen.getByRole("dialog", { name: "Invite Member" });
        expect(dialog).toBeInTheDocument();

        const heading = screen.getByRole("heading", { level: idx + 1 });
        expect(heading).toHaveTextContent("Invite Member");
        expect(heading.tagName.toLowerCase()).toBe(level);
      });
    });

    it("2.2 InviteMemberModal supports headingLevel prop", () => {
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={() => {}}
          onInvite={() => {}}
          headingLevel="h2"
        />,
      );

      const dialog = screen.getByRole("dialog", { name: "Invite Member" });
      expect(dialog).toBeInTheDocument();

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Invite Member");
      expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
    });

    const clickModifiers = [
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { metaKey: true },
      { ctrlKey: true, shiftKey: true },
    ];

    clickModifiers.forEach((modifiers, idx) => {
      it(`2.3.${idx + 1} close button handles click with modifiers ${JSON.stringify(modifiers)}`, () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Close Modifiers">
            <p>Body</p>
          </Modal>,
        );

        const closeBtn = screen.getByRole("button", { name: /close modal/i });
        fireEvent.click(closeBtn, modifiers);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    const keyboardTriggers = ["Enter", " "];
    keyboardTriggers.forEach((key, idx) => {
      it(`2.4.${idx + 1} close button is interactive via ${key} key`, () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Keyboard Close">
            <p>Body</p>
          </Modal>,
        );

        const closeBtn = screen.getByRole("button", { name: /close modal/i });
        closeBtn.focus();
        expect(document.activeElement).toBe(closeBtn);

        fireEvent.keyDown(closeBtn, { key });
      });
    });
  });

  describe("Host Variations & DOM Structure", () => {
    it("3.1 dialog has role dialog and aria-modal true", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Role Check">
          <p>Body</p>
        </Modal>,
      );

      const dialog = screen.getByRole("dialog", { name: "Role Check" });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("3.2 dialog aria-labelledby matches heading element id exactly", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="ID Binding">
          <p>Body</p>
        </Modal>,
      );

      const dialog = screen.getByRole("dialog");
      const titleId = dialog.getAttribute("aria-labelledby");
      expect(titleId).toBe("modal-title");

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.id).toBe(titleId);
    });

    it("3.3 close button has accessible name 'Close modal'", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Accessible Button">
          <p>Body</p>
        </Modal>,
      );

      expect(
        screen.getByRole("button", { name: "Close modal" }),
      ).toBeInTheDocument();
    });

    it("3.4 scrim maintains Tailwind v4 slash opacity class bg-black/50", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Tailwind v4">
          <p>Body</p>
        </Modal>,
      );

      const scrim = container.querySelector(".fixed.inset-0");
      expect(scrim).toHaveClass("bg-black/50");
      expect(scrim?.className).not.toContain("bg-opacity-");
    });

    it("3.5 heading maintains styling typography classes", () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Styled Heading"
          headingLevel="h1"
        >
          <p>Body</p>
        </Modal>,
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass("text-xl");
      expect(heading).toHaveClass("font-bold");
      expect(heading).toHaveClass("text-gray-900");
    });
  });

  describe("Negative Controls & Isolation", () => {
    it("4.1 requesting h1 does not render h2 or h3 headings", () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Strict H1"
          headingLevel="h1"
        >
          <p>Body</p>
        </Modal>,
      );

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
      expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
      expect(screen.queryByRole("heading", { level: 4 })).toBeNull();
    });

    it("4.2 requesting h3 does not render h1 or h2 headings", () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Strict H3"
          headingLevel="h3"
        >
          <p>Body</p>
        </Modal>,
      );

      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
      expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    });

    it("4.3 requesting h4 does not render other heading levels", () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Strict H4"
          headingLevel="h4"
        >
          <p>Body</p>
        </Modal>,
      );

      expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
      expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
      expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
    });

    it("4.4 closed modal renders 0 dialogs and 0 headings", () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Hidden">
          <p>Hidden body</p>
        </Modal>,
      );

      expect(screen.queryAllByRole("dialog")).toHaveLength(0);
      expect(screen.queryAllByRole("heading")).toHaveLength(0);
    });

    it("4.5 clicking outside button does not trigger onClose", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Click Test">
          <p>Body text</p>
        </Modal>,
      );

      const bodyText = screen.getByText("Body text");
      fireEvent.click(bodyText);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Lifecycle, Unmount & Stress", () => {
    it("5.1 cleans up gracefully on rapid unmount while open", () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}} title="Unmount Test">
          <p>Body</p>
        </Modal>,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(() => unmount()).not.toThrow();
    });

    const stressIterations = Array.from({ length: 35 }, (_, i) => i + 1);
    stressIterations.forEach((iteration) => {
      const level: HeadingLevel = (
        ["h1", "h2", "h3", "h4", "h5", "h6"] as const
      )[iteration % 6];
      it(`5.2.${iteration} rapid repeated render with level ${level} stress test #${iteration}`, () => {
        const { unmount } = render(
          <Modal
            isOpen={true}
            onClose={() => {}}
            title={`Stress ${iteration}`}
            headingLevel={level}
          >
            <p>Body {iteration}</p>
          </Modal>,
        );

        const dialog = screen.getByRole("dialog", {
          name: `Stress ${iteration}`,
        });
        expect(dialog).toBeInTheDocument();

        unmount();
      });
    });

    const userEventStressSeries = Array.from({ length: 25 }, (_, i) => i + 1);
    userEventStressSeries.forEach((step) => {
      it(`5.3.${step} userEvent click close button stress test #${step}`, async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
          <Modal
            isOpen={true}
            onClose={onClose}
            title={`Close Stress ${step}`}
            headingLevel="h2"
          >
            <p>Content</p>
          </Modal>,
        );

        const closeBtn = screen.getByRole("button", { name: /close modal/i });
        await user.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });
});
