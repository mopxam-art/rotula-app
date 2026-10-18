import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildInviteUrl,
  buildWhatsAppShareUrl,
  FALLBACK_INVITE_ORIGIN,
  generateInviteCode,
} from "@/utils/invite";

describe("generateInviteCode", () => {
  it("produces a URL-safe code of the requested length", () => {
    const code = generateInviteCode(12);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
    expect(code).toHaveLength(12);
  });

  it("defaults to a 9-character code", () => {
    expect(generateInviteCode()).toHaveLength(9);
  });

  it("produces different codes across calls", () => {
    expect(generateInviteCode()).not.toBe(generateInviteCode());
  });
});

describe("buildInviteUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses an explicit origin when provided", () => {
    expect(buildInviteUrl("abc123", "https://example.com")).toBe(
      "https://example.com/invite/abc123",
    );
  });

  it("defaults to the current window origin on the client", () => {
    expect(buildInviteUrl("clientcode")).toBe(
      `${window.location.origin}/invite/clientcode`,
    );
  });

  it("falls back to FALLBACK_INVITE_ORIGIN when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(buildInviteUrl("servercode")).toBe(
      `${FALLBACK_INVITE_ORIGIN}/invite/servercode`,
    );
  });
});

describe("buildWhatsAppShareUrl", () => {
  it("encodes the message text and url into the wa.me deep link", () => {
    const inviteUrl = `${FALLBACK_INVITE_ORIGIN}/invite/abc123`;
    expect(buildWhatsAppShareUrl(inviteUrl, "Join my group")).toBe(
      `https://wa.me/?text=${encodeURIComponent(`Join my group ${inviteUrl}`)}`,
    );
  });

  it("shares the bare url when no text is provided", () => {
    const inviteUrl = `${FALLBACK_INVITE_ORIGIN}/invite/abc123`;
    expect(buildWhatsAppShareUrl(inviteUrl)).toBe(
      `https://wa.me/?text=${encodeURIComponent(inviteUrl)}`,
    );
  });
});
