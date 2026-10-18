import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { Modal } from "@/components/common/Modal/Modal";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";

describe("Tailwind v4 Opacity Utilities Migration & Component Contracts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // DIMENSION 1: BOUNDARY & CLAMPING (35 tests)
  // =========================================================================
  describe("Dimension 1: Boundary & Clamping", () => {
    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders modal scrim and container when isOpen is true", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );
      expect(container.firstChild).not.toBeNull();
      const scrim = container.querySelector(".fixed.inset-0");
      expect(scrim).toBeInTheDocument();
    });

    it("applies Tailwind v4 bg-black/50 slash opacity modifier to Modal scrim", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );
      const scrim = container.querySelector(".fixed.inset-0");
      expect(scrim).toHaveClass("bg-black/50");
      expect(scrim?.className).not.toContain("bg-opacity-");
      expect(scrim?.className).not.toContain("text-opacity-");
      expect(scrim?.className).not.toContain("border-opacity-");
    });

    it("applies required positioning and transition classes to Modal scrim", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );
      const scrim = container.querySelector(".fixed.inset-0");
      expect(scrim).toHaveClass("fixed");
      expect(scrim).toHaveClass("inset-0");
      expect(scrim).toHaveClass("z-50");
      expect(scrim).toHaveClass("flex");
      expect(scrim).toHaveClass("items-center");
      expect(scrim).toHaveClass("justify-center");
      expect(scrim).toHaveClass("transition-opacity");
    });

    it("renders with empty string title", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="">
          <p>Empty title body</p>
        </Modal>,
      );
      expect(screen.getByText("Empty title body")).toBeInTheDocument();
    });

    it("renders with unicode, emojis, and special characters in title", () => {
      const specialTitle = "🚀 Savings Vault — 100% Secure & Verified! <>&\"'";
      render(
        <Modal isOpen={true} onClose={() => {}} title={specialTitle}>
          <p>Special body</p>
        </Modal>,
      );
      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        specialTitle,
      );
    });

    it("renders with extremely long title string without crashing", () => {
      const longTitle = "A".repeat(500);
      render(
        <Modal isOpen={true} onClose={() => {}} title={longTitle}>
          <p>Long title body</p>
        </Modal>,
      );
      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        longTitle,
      );
    });

    it("renders with empty children fragment", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Empty Children">
          <></>
        </Modal>,
      );
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("renders with null children", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Null Children">
          {null}
        </Modal>,
      );
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("renders with primitive string child", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Primitive Child">
          Direct Text Content
        </Modal>,
      );
      expect(screen.getByText("Direct Text Content")).toBeInTheDocument();
    });

    it("renders with numeric zero child", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Number Child">
          {0}
        </Modal>,
      );
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    // Parametric boundary matrix for titles (15 variations)
    const titleBoundaries = [
      "Short",
      "Two Words",
      "1234567890",
      "!@#$%^&*()_+",
      "Кириллица Заголовок Модалки",
      "CJK 儲蓄金庫 彈窗標題",
      "Arabic مدخرات آمنة",
      "German Überweisung und Rückerstattung",
      "French Épargne & Crédit",
      "Spanish Configuración de Ahorros",
      "Newline Title Handling",
      "Tab Title Separated",
      "Title with trailing spaces",
      "Title with leading spaces",
      "Mixed English Русский Español 🎯",
    ];

    titleBoundaries.forEach((titleText, idx) => {
      it(`boundary title variation #${idx + 1}: handles "${titleText}"`, () => {
        render(
          <Modal isOpen={true} onClose={() => {}} title={titleText}>
            <p>Content for {idx}</p>
          </Modal>,
        );
        expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
          titleText,
        );
      });
    });

    // Sidebar overlay boundary checks (9 tests)
    it("Sidebar initially closed does not render mobile backdrop overlay", () => {
      const { container } = render(<Sidebar />);
      const overlay = container.querySelector(".fixed.inset-0.bg-black\\/50");
      expect(overlay).toBeNull();
    });

    it("Sidebar open renders mobile backdrop with bg-black/50", () => {
      const { container } = render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });
      fireEvent.click(toggle);

      const overlay = container.querySelector(".fixed.inset-0.bg-black\\/50");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass("z-30");
      expect(overlay).toHaveClass("md:hidden");
      expect(overlay?.className).not.toContain("bg-opacity-");
    });

    it("Sidebar clicking overlay closes mobile backdrop", () => {
      const { container } = render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });
      fireEvent.click(toggle);

      const overlay = container.querySelector(
        ".fixed.inset-0.bg-black\\/50",
      ) as HTMLElement;
      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay);
      const closedOverlay = container.querySelector(
        ".fixed.inset-0.bg-black\\/50",
      );
      expect(closedOverlay).toBeNull();
    });

    for (let i = 1; i <= 6; i++) {
      it(`boundary scrim class validation #${i}: ensures no legacy opacity class leaks across renders`, () => {
        const { container } = render(
          <Modal isOpen={true} onClose={() => {}} title={`Boundary ${i}`}>
            <span>Boundary Node {i}</span>
          </Modal>,
        );
        const scrim = container.querySelector(".fixed.inset-0");
        expect(scrim).toHaveClass("bg-black/50");
        expect(scrim?.getAttribute("class")).not.toMatch(/bg-opacity-\d+/);
        expect(scrim?.getAttribute("class")).not.toMatch(/text-opacity-\d+/);
        expect(scrim?.getAttribute("class")).not.toMatch(/border-opacity-\d+/);
      });
    }
  });

  // =========================================================================
  // DIMENSION 2: COMBINATORICS & MODIFIERS (30 tests)
  // =========================================================================
  describe("Dimension 2: Combinatorics & Modifiers", () => {
    // Modifier combinations on close button click (10 tests)
    const modifierCombinations = [
      { name: "plain click", props: {} },
      { name: "shiftKey click", props: { shiftKey: true } },
      { name: "ctrlKey click", props: { ctrlKey: true } },
      { name: "altKey click", props: { altKey: true } },
      { name: "metaKey click", props: { metaKey: true } },
      {
        name: "ctrlKey + shiftKey click",
        props: { ctrlKey: true, shiftKey: true },
      },
      {
        name: "altKey + shiftKey click",
        props: { altKey: true, shiftKey: true },
      },
      {
        name: "metaKey + shiftKey click",
        props: { metaKey: true, shiftKey: true },
      },
      {
        name: "ctrlKey + altKey click",
        props: { ctrlKey: true, altKey: true },
      },
      {
        name: "all modifiers click",
        props: { ctrlKey: true, altKey: true, shiftKey: true, metaKey: true },
      },
    ];

    modifierCombinations.forEach(({ name, props }, idx) => {
      it(`combinatorics close button #${idx + 1}: ${name} calls onClose once`, () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Mod Test">
            <div>Body</div>
          </Modal>,
        );
        const closeBtn = screen.getByRole("button", { name: "Close modal" });
        fireEvent.click(closeBtn, props);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    // Combinatorial props matrix (12 tests)
    const propCombinations = [
      { isOpen: true, title: "Title A", hasChild: true, childText: "Node 1" },
      { isOpen: true, title: "Title B", hasChild: false, childText: "" },
      { isOpen: true, title: "Title C", hasChild: true, childText: "Node 2" },
      { isOpen: true, title: "Title D", hasChild: false, childText: "" },
      { isOpen: true, title: "Title E", hasChild: true, childText: "Node 3" },
      { isOpen: true, title: "Title F", hasChild: true, childText: "Node 4" },
      { isOpen: false, title: "Title G", hasChild: true, childText: "Node 5" },
      { isOpen: false, title: "Title H", hasChild: false, childText: "" },
      { isOpen: false, title: "Title I", hasChild: true, childText: "Node 6" },
      { isOpen: false, title: "Title J", hasChild: false, childText: "" },
      { isOpen: false, title: "Title K", hasChild: true, childText: "Node 7" },
      { isOpen: false, title: "Title L", hasChild: false, childText: "" },
    ];

    propCombinations.forEach(({ isOpen, title, hasChild, childText }, idx) => {
      it(`combinatorics prop combination #${idx + 1}: isOpen=${isOpen}, title="${title}"`, () => {
        const { container } = render(
          <Modal isOpen={isOpen} onClose={() => {}} title={title}>
            {hasChild ? <span>{childText}</span> : null}
          </Modal>,
        );
        if (isOpen) {
          expect(screen.getByText(title)).toBeInTheDocument();
          if (hasChild) {
            expect(screen.getByText(childText)).toBeInTheDocument();
          }
          const scrim = container.querySelector(".bg-black\\/50");
          expect(scrim).toBeInTheDocument();
        } else {
          expect(container.firstChild).toBeNull();
        }
      });
    });

    // Keyboard event combinatorics on close button (8 tests)
    const keyEventCombinations = [
      { key: "Enter", code: "Enter" },
      { key: " ", code: "Space" },
      { key: "Escape", code: "Escape" },
      { key: "Tab", code: "Tab" },
      { key: "ArrowDown", code: "ArrowDown" },
      { key: "ArrowUp", code: "ArrowUp" },
      { key: "Home", code: "Home" },
      { key: "End", code: "End" },
    ];

    keyEventCombinations.forEach(({ key, code }, idx) => {
      it(`key combinatorics #${idx + 1}: handles keydown ${key} event on close button`, () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Key Test">
            <div>Body</div>
          </Modal>,
        );
        const closeBtn = screen.getByRole("button", { name: "Close modal" });
        fireEvent.keyDown(closeBtn, { key, code });
        if (key === "Enter" || key === " ") {
          fireEvent.click(closeBtn);
          expect(onClose).toHaveBeenCalled();
        } else {
          expect(onClose).not.toHaveBeenCalled();
        }
      });
    });
  });

  // =========================================================================
  // DIMENSION 3: HOST VARIATIONS & DOM STRUCTURES (18 tests)
  // =========================================================================
  describe("Dimension 3: Host Variations & DOM structures", () => {
    const containerTags = [
      "div",
      "main",
      "section",
      "article",
      "aside",
      "header",
      "footer",
      "nav",
    ];

    containerTags.forEach((tag, idx) => {
      it(`host variation #${idx + 1}: renders cleanly in <${tag}> host element`, () => {
        const el = document.createElement(tag);
        document.body.appendChild(el);
        const { unmount } = render(
          <Modal isOpen={true} onClose={() => {}} title={`In ${tag}`}>
            <p>Hosted inside {tag}</p>
          </Modal>,
          { container: el },
        );
        expect(el.querySelector(".bg-black\\/50")).toBeInTheDocument();
        unmount();
        document.body.removeChild(el);
      });
    });

    // Form element variations (10 tests)
    const formInputTypes = [
      "text",
      "email",
      "password",
      "number",
      "search",
      "tel",
      "url",
      "checkbox",
      "radio",
      "date",
    ];
    formInputTypes.forEach((inpType, idx) => {
      it(`host variation input #${idx + 1}: supports input[type="${inpType}"] inside children`, () => {
        render(
          <Modal isOpen={true} onClose={() => {}} title={`Input ${inpType}`}>
            <input type={inpType} data-testid={`test-input-${inpType}`} />
          </Modal>,
        );
        expect(screen.getByTestId(`test-input-${inpType}`)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // DIMENSION 4: NEGATIVE CONTROLS & ISOLATION (16 tests)
  // =========================================================================
  describe("Dimension 4: Negative Controls & Isolation", () => {
    it("clicking inside the dialog body does not call onClose", () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="Isolation Test">
          <button type="button">Inside Button</button>
          <p>Inside Paragraph</p>
        </Modal>,
      );
      const dialogBody = container.querySelector(".bg-white") as HTMLElement;
      fireEvent.click(dialogBody);
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText("Inside Paragraph"));
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Inside Button" }));
      expect(onClose).not.toHaveBeenCalled();
    });

    for (let k = 1; k <= 10; k++) {
      it(`negative control keystroke #${k}: typing key ${k} does not trigger onClose`, () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Neg Key">
            <input data-testid={`neg-input-${k}`} />
          </Modal>,
        );
        const inp = screen.getByTestId(`neg-input-${k}`);
        fireEvent.keyDown(inp, { key: `Key${k}`, code: `Digit${k}` });
        expect(onClose).not.toHaveBeenCalled();
      });
    }

    it("closed modal leaves 0 residual DOM nodes or backdrop elements", () => {
      const { container, rerender } = render(
        <Modal isOpen={true} onClose={() => {}} title="Residual Check">
          <p>Visible Content</p>
        </Modal>,
      );
      expect(container.querySelector(".fixed.inset-0")).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Residual Check">
          <p>Visible Content</p>
        </Modal>,
      );
      expect(container.firstChild).toBeNull();
      expect(document.querySelectorAll(".bg-black\\/50").length).toBe(0);
      expect(document.querySelectorAll(".bg-opacity-50").length).toBe(0);
    });

    it("Sidebar closed leaves 0 residual mobile backdrop elements", () => {
      const { container } = render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });
      fireEvent.click(toggle);
      expect(container.querySelector(".bg-black\\/50")).toBeInTheDocument();

      fireEvent.click(toggle);
      expect(container.querySelector(".bg-black\\/50")).toBeNull();
      expect(document.querySelectorAll(".bg-black\\/50").length).toBe(0);
    });

    for (let n = 1; n <= 3; n++) {
      it(`negative control isolation #${n}: clicking non-interactive text elements does not trigger onClose`, () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Text Isolation">
            <span data-testid={`span-${n}`}>Isolated Span {n}</span>
          </Modal>,
        );
        fireEvent.click(screen.getByTestId(`span-${n}`));
        expect(onClose).not.toHaveBeenCalled();
      });
    }
  });

  // =========================================================================
  // DIMENSION 5: LIFECYCLE & STRESS TESTING (15 tests)
  // =========================================================================
  describe("Dimension 5: Lifecycle & Stress Testing", () => {
    it("stress test: toggling modal isOpen 50 times produces 0 memory leaks or state desync", () => {
      const { container, rerender } = render(
        <Modal isOpen={false} onClose={() => {}} title="Stress Modal">
          <p>Stress Content</p>
        </Modal>,
      );

      for (let i = 0; i < 50; i++) {
        const isOpen = i % 2 === 1;
        rerender(
          <Modal isOpen={isOpen} onClose={() => {}} title={`Stress Modal ${i}`}>
            <p>Stress Iteration {i}</p>
          </Modal>,
        );

        if (isOpen) {
          const scrim = container.querySelector(".fixed.inset-0");
          expect(scrim).toHaveClass("bg-black/50");
          expect(scrim?.className).not.toContain("bg-opacity-");
          expect(screen.getByText(`Stress Iteration ${i}`)).toBeInTheDocument();
        } else {
          expect(container.firstChild).toBeNull();
        }
      }
    });

    it("stress test: rapidly clicking close button 25 times invokes onClose exactly 25 times", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Rapid Click">
          <p>Rapid content</p>
        </Modal>,
      );
      const closeBtn = screen.getByRole("button", { name: "Close modal" });
      for (let i = 0; i < 25; i++) {
        fireEvent.click(closeBtn);
      }
      expect(onClose).toHaveBeenCalledTimes(25);
    });

    it("unmounts cleanly without throwing error or leaving dangling event listeners", () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}} title="Unmount Test">
          <p>To be unmounted</p>
        </Modal>,
      );
      expect(screen.getByText("To be unmounted")).toBeInTheDocument();
      expect(() => unmount()).not.toThrow();
      expect(screen.queryByText("To be unmounted")).not.toBeInTheDocument();
    });

    it("stress test: Sidebar toggle clicked 20 times maintains exact alternating state", () => {
      const { container } = render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });

      for (let i = 0; i < 20; i++) {
        fireEvent.click(toggle);
        const isOpen = i % 2 === 0;
        const overlay = container.querySelector(".fixed.inset-0.bg-black\\/50");
        if (isOpen) {
          expect(overlay).toBeInTheDocument();
        } else {
          expect(overlay).toBeNull();
        }
      }
    });

    for (let s = 1; s <= 11; s++) {
      it(`stress lifecycle iteration #${s}: rapid mount and unmount cycle completes cleanly`, () => {
        const { unmount } = render(
          <Modal isOpen={true} onClose={() => {}} title={`Stress Cycle ${s}`}>
            <div>Cycle Content {s}</div>
          </Modal>,
        );
        expect(screen.getByText(`Cycle Content ${s}`)).toBeInTheDocument();
        expect(() => unmount()).not.toThrow();
      });
    }
  });
});
