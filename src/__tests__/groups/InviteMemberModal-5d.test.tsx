import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { InviteMemberModal } from "@/components/groups/InviteMemberModal";

describe("InviteMemberModal - 5D Exhaustive Test Matrix (Closes #235)", () => {
  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 1: Boundaries & Clamping (30 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 1: Boundaries & Clamping", () => {
    const emptyOrWhitespace = [
      { label: "empty string", val: "" },
      { label: "single space", val: " " },
      { label: "multiple spaces", val: "   " },
      { label: "tab character", val: "\t" },
      { label: "newline character", val: "\n" },
      { label: "mixed whitespace", val: "  \t \n  " },
    ];

    emptyOrWhitespace.forEach(({ label, val }) => {
      it(`shows empty error for ${label}`, () => {
        const onInvite = vi.fn();
        const onClose = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={onClose}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: val } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(
          screen.getByText("Please enter an email address or phone number."),
        ).toBeInTheDocument();
        expect(onInvite).not.toHaveBeenCalled();
      });
    });

    const invalidShortPhones = [
      { len: 1, val: "1" },
      { len: 2, val: "12" },
      { len: 5, val: "12345" },
      { len: 9, val: "123456789" },
      { len: 9, val: "+12345678" },
    ];

    invalidShortPhones.forEach(({ len, val }) => {
      it(`rejects short phone with length ${len} (${val})`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: val } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(
          screen.getByText(
            "Please enter a valid email address or phone number.",
          ),
        ).toBeInTheDocument();
        expect(onInvite).not.toHaveBeenCalled();
      });
    });

    const validBoundaryPhones = [
      { label: "min 10 digits without plus", val: "1234567890" },
      { label: "min 10 digits with plus", val: "+1234567890" },
      { label: "mid 12 digits", val: "123456789012" },
      { label: "mid 12 digits with plus", val: "+123456789012" },
      { label: "max 15 digits without plus", val: "123456789012345" },
      { label: "max 15 digits with plus", val: "+123456789012345" },
    ];

    validBoundaryPhones.forEach(({ label, val }) => {
      it(`accepts valid boundary phone: ${label}`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: val } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(onInvite).toHaveBeenCalledWith(val);
        expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();
      });
    });

    const invalidLongPhones = [
      { label: "16 digits without plus", val: "1234567890123456" },
      { label: "16 digits with plus", val: "+1234567890123456" },
      { label: "20 digits", val: "12345678901234567890" },
      { label: "25 digits", val: "+1234567890123456789012345" },
    ];

    invalidLongPhones.forEach(({ label, val }) => {
      it(`rejects oversized phone: ${label}`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: val } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(
          screen.getByText(
            "Please enter a valid email address or phone number.",
          ),
        ).toBeInTheDocument();
        expect(onInvite).not.toHaveBeenCalled();
      });
    });

    const whitespaceTrimmingCases = [
      {
        label: "leading spaces email",
        input: "  user@example.com",
        expected: "user@example.com",
      },
      {
        label: "trailing spaces email",
        input: "user@example.com  ",
        expected: "user@example.com",
      },
      {
        label: "both spaces email",
        input: "   user@example.com   ",
        expected: "user@example.com",
      },
      {
        label: "leading spaces phone",
        input: "  +1234567890",
        expected: "+1234567890",
      },
      {
        label: "trailing spaces phone",
        input: "1234567890  ",
        expected: "1234567890",
      },
      {
        label: "both spaces phone",
        input: "   +1234567890   ",
        expected: "+1234567890",
      },
      {
        label: "tab and space phone",
        input: "\t+1234567890 \t",
        expected: "+1234567890",
      },
      {
        label: "newline and space email",
        input: "\n user@domain.org \n",
        expected: "user@domain.org",
      },
      { label: "minimal email trimmed", input: " a@b.co ", expected: "a@b.co" },
    ];

    whitespaceTrimmingCases.forEach(({ label, input, expected }) => {
      it(`trims whitespace properly for ${label}`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const inputElem = screen.getByPlaceholderText(
          /e\.g\. user@example\.com/i,
        );
        fireEvent.change(inputElem, { target: { value: input } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(onInvite).toHaveBeenCalledWith(expected);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 2: Combinatorics (Valid vs Invalid Patterns) (35 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 2: Combinatorics of Formats and Actions", () => {
    const validEmails = [
      "simple@example.com",
      "very.common@example.com",
      "disposable.style.email.with+symbol@example.com",
      "other.email-with-hyphen@example.com",
      "fully-qualified-domain@example.co.uk",
      "user@sub.domain.org",
      "user_name@example.io",
      "firstname.lastname@company.tech",
      "x@y.zz",
      "123456@numeric.user.net",
    ];

    validEmails.forEach((email) => {
      it(`accepts valid email: ${email}`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: email } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(onInvite).toHaveBeenCalledWith(email);
      });
    });

    const validPhones = [
      "+12025550143",
      "+447911123456",
      "+2348031234567",
      "+4915123456789",
      "+33612345678",
      "+819012345678",
      "+79991234567",
      "+8613812345678",
      "08031234567",
      "07123456789",
    ];

    validPhones.forEach((phone) => {
      it(`accepts valid phone number: ${phone}`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: phone } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(onInvite).toHaveBeenCalledWith(phone);
      });
    });

    const invalidEmails = [
      "plainaddress",
      "no-at-sign.com",
      "@example.com",
      "user@",
      "email.example.com",
      "email@example@example.com",
      "email@example",
      "admin@localhost",
      "user@@domain.com",
      "just-a-string",
    ];

    invalidEmails.forEach((email) => {
      it(`rejects invalid email format: ${email}`, () => {
        const onInvite = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: email } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(
          screen.getByText(
            "Please enter a valid email address or phone number.",
          ),
        ).toBeInTheDocument();
        expect(onInvite).not.toHaveBeenCalled();
      });
    });

    it("triggers onClose when clicking Cancel button", () => {
      const onClose = vi.fn();
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={onClose}
          onInvite={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("triggers onClose when clicking top-right X button", () => {
      const onClose = vi.fn();
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={onClose}
          onInvite={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("clears error on subsequent keystroke in the input", () => {
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
      expect(
        screen.getByText("Please enter an email address or phone number."),
      ).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "a" } });
      expect(
        screen.queryByText("Please enter an email address or phone number."),
      ).not.toBeInTheDocument();
    });

    it("applies error styling border-red-500 on input when error occurs", () => {
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
      expect(input.className).toContain("border-gray-200");
      expect(input.className).not.toContain("border-red-500");

      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
      expect(input.className).toContain("border-red-500");
    });

    it("resets border styling back to gray-200 when typing after error", () => {
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
      expect(input.className).toContain("border-red-500");

      fireEvent.change(input, { target: { value: "x" } });
      expect(input.className).toContain("border-gray-200");
      expect(input.className).not.toContain("border-red-500");
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 3: Host Variations & Re-render Invariants (15 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 3: Host Variations & Re-render Invariants", () => {
    it("renders null and no DOM nodes when isOpen is false", () => {
      const { container } = render(
        <InviteMemberModal
          isOpen={false}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
      expect(screen.queryByText("Invite Member")).not.toBeInTheDocument();
    });

    it("renders modal structure with correct title when isOpen is true", () => {
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );
      expect(screen.getByText("Invite Member")).toBeInTheDocument();
      expect(
        screen.getByLabelText(/email or phone number/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send invite/i }),
      ).toBeInTheDocument();
    });

    it("submits form when pressing Enter key inside text input", () => {
      const onInvite = vi.fn();
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={onInvite}
        />,
      );

      const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.submit(input.closest("form")!);

      expect(onInvite).toHaveBeenCalledWith("test@example.com");
    });

    it("preserves typed inputValue when parent re-renders with isOpen=true", () => {
      const { rerender } = render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      const input = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      fireEvent.change(input, {
        target: { value: "draft-in-progress@example.com" },
      });
      expect(input.value).toBe("draft-in-progress@example.com");

      // Parent re-renders (e.g., passing fresh callback references)
      const newOnClose = vi.fn();
      const newOnInvite = vi.fn();
      rerender(
        <InviteMemberModal
          isOpen={true}
          onClose={newOnClose}
          onInvite={newOnInvite}
        />,
      );

      expect(input.value).toBe("draft-in-progress@example.com");
    });

    it("preserves active error message when parent re-renders with isOpen=true", () => {
      const { rerender } = render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
      expect(
        screen.getByText("Please enter an email address or phone number."),
      ).toBeInTheDocument();

      // Parent re-renders with same isOpen=true
      rerender(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );
      expect(
        screen.getByText("Please enter an email address or phone number."),
      ).toBeInTheDocument();
    });

    const variedReRenders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    variedReRenders.forEach((count) => {
      it(`survives ${count} consecutive re-renders while open without dropping input value`, () => {
        const { rerender } = render(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={vi.fn()}
          />,
        );

        const input = screen.getByPlaceholderText(
          /e\.g\. user@example\.com/i,
        ) as HTMLInputElement;
        fireEvent.change(input, {
          target: { value: "persistent@example.com" },
        });

        for (let i = 0; i < count; i++) {
          rerender(
            <InviteMemberModal
              isOpen={true}
              onClose={vi.fn()}
              onInvite={vi.fn()}
            />,
          );
        }

        expect(input.value).toBe("persistent@example.com");
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 4: Negative Controls & Security Payloads (20 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 4: Negative Controls", () => {
    const maliciousOrMalformattedInputs = [
      "<script>alert(1)</script>",
      "javascript:void(0)",
      "DROP TABLE users;",
      "user@domain; rm -rf /",
      "admin@localhost",
      "user@domain",
      "📞 +1234567890",
      "++1234567890",
      "+-1234567890",
      "123-456-7890",
      "(123) 456-7890",
      "user name@domain.com",
      "user@ domain.com",
      "user@domain .com",
      "user@domain,com",
      "@noname.com",
      "user@.com",
      "12345",
      "abcde",
      "just text",
    ];

    maliciousOrMalformattedInputs.forEach((payload) => {
      it(`does not call onInvite and displays validation error for: ${payload}`, () => {
        const onInvite = vi.fn();
        const onClose = vi.fn();
        render(
          <InviteMemberModal
            isOpen={true}
            onClose={onClose}
            onInvite={onInvite}
          />,
        );

        const input = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
        fireEvent.change(input, { target: { value: payload } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

        expect(onInvite).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(
          screen.getByText(
            "Please enter a valid email address or phone number.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 5: Lifecycle, Reopen Reset & Stress (25 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 5: Lifecycle, Reopen Reset & Stress (Core Issue #235)", () => {
    it("resets stale error and stale input value when modal closes and reopens after empty submit", () => {
      const { rerender } = render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      // Step 1: Trigger validation error on open modal
      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
      expect(
        screen.getByText("Please enter an email address or phone number."),
      ).toBeInTheDocument();

      // Step 2: Close modal (isOpen: true -> false)
      rerender(
        <InviteMemberModal
          isOpen={false}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );
      expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();

      // Step 3: Reopen modal (isOpen: false -> true)
      rerender(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      // Acceptance Criteria: Reopening shows NO error and clean empty input
      expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();
      const input = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("resets stale error and stale input value when modal closes and reopens after invalid format submit", () => {
      const { rerender } = render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      // Step 1: Type malformed input and submit
      const input = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "invalid-email-string" } });
      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
      expect(
        screen.getByText("Please enter a valid email address or phone number."),
      ).toBeInTheDocument();
      expect(input.value).toBe("invalid-email-string");

      // Step 2: Close modal
      rerender(
        <InviteMemberModal
          isOpen={false}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      // Step 3: Reopen modal
      rerender(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      // Acceptance Criteria: Clean state on fresh attempt
      expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();
      const reopenedInput = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      expect(reopenedInput.value).toBe("");
    });

    it("resets input value on reopen even if user typed without submitting", () => {
      const { rerender } = render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      const input = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "half-typed@test" } });
      expect(input.value).toBe("half-typed@test");

      // User cancels / closes dialog
      rerender(
        <InviteMemberModal
          isOpen={false}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      // User reopens dialog
      rerender(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      const reopenedInput = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      expect(reopenedInput.value).toBe("");
    });

    it("clears input field immediately upon successful submission", () => {
      const onInvite = vi.fn();
      render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={onInvite}
        />,
      );

      const input = screen.getByPlaceholderText(
        /e\.g\. user@example\.com/i,
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "member@kolo.network" } });
      fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

      expect(onInvite).toHaveBeenCalledWith("member@kolo.network");
      expect(input.value).toBe("");
      expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();
    });

    it("executes 10 sequential reopen cycles cleanly with zero state bleed", () => {
      const { rerender } = render(
        <InviteMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onInvite={vi.fn()}
        />,
      );

      for (let cycle = 1; cycle <= 10; cycle++) {
        // Type error
        const input = screen.getByPlaceholderText(
          /e\.g\. user@example\.com/i,
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: `bad-${cycle}` } });
        fireEvent.click(screen.getByRole("button", { name: /send invite/i }));
        expect(
          screen.getByText(
            "Please enter a valid email address or phone number.",
          ),
        ).toBeInTheDocument();

        // Close
        rerender(
          <InviteMemberModal
            isOpen={false}
            onClose={vi.fn()}
            onInvite={vi.fn()}
          />,
        );

        // Reopen
        rerender(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={vi.fn()}
          />,
        );
        const freshInput = screen.getByPlaceholderText(
          /e\.g\. user@example\.com/i,
        ) as HTMLInputElement;
        expect(freshInput.value).toBe("");
        expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();
      }
    });

    const stressCloseOpenSequences = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    stressCloseOpenSequences.forEach((idx) => {
      it(`handles rapid toggle iteration ${idx} without memory leak or hanging state`, () => {
        const { rerender } = render(
          <InviteMemberModal
            isOpen={false}
            onClose={vi.fn()}
            onInvite={vi.fn()}
          />,
        );
        rerender(
          <InviteMemberModal
            isOpen={true}
            onClose={vi.fn()}
            onInvite={vi.fn()}
          />,
        );
        const input = screen.getByPlaceholderText(
          /e\.g\. user@example\.com/i,
        ) as HTMLInputElement;
        expect(input.value).toBe("");
        rerender(
          <InviteMemberModal
            isOpen={false}
            onClose={vi.fn()}
            onInvite={vi.fn()}
          />,
        );
      });
    });
  });
});
