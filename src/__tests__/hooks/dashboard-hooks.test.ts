import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWallet } from "@/hooks/useWallet";
import { useGroups } from "@/hooks/useGroups";
import { usePayments } from "@/hooks/usePayments";
import { walletService } from "@/services/api/wallet";
import { groupsService } from "@/services/api/groups";
import { paymentsService } from "@/services/api/payments";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user-1" } }),
}));

vi.mock("@/services/api/wallet", () => ({
  walletService: {
    getWallet: vi.fn(),
  },
}));

vi.mock("@/services/api/groups", () => ({
  groupsService: {
    getSavingsGroups: vi.fn(),
  },
}));

vi.mock("@/services/api/payments", () => ({
  paymentsService: {
    getPayments: vi.fn(),
  },
}));

describe("Dashboard Hooks - Data Layer Failure & Reachable Error States (#304)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useWallet", () => {
    it("successfully sets wallet data on successful data layer response", async () => {
      vi.mocked(walletService.getWallet).mockResolvedValue({
        balance: 1000,
        currency: "USDC",
        trendPercentage: 3.5,
      });

      const { result } = renderHook(() => useWallet());
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data?.balance).toBe(1000);
    });

    it("surfaces real failure from data layer and populates error state", async () => {
      vi.mocked(walletService.getWallet).mockRejectedValue(
        new Error("Stellar RPC unavailable"),
      );

      const { result } = renderHook(() => useWallet());
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Stellar RPC unavailable");
    });
  });

  describe("useGroups", () => {
    it("successfully sets savings groups on successful data layer response", async () => {
      vi.mocked(groupsService.getSavingsGroups).mockResolvedValue([
        {
          id: "g-1",
          name: "Test Group",
          tag: "SAVINGS",
          saved: 500,
          target: 1000,
          nextDate: "Nov 01",
          avatars: [],
        },
      ]);

      const { result } = renderHook(() => useGroups());
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toHaveLength(1);
    });

    it("surfaces real failure from data layer and populates error state", async () => {
      vi.mocked(groupsService.getSavingsGroups).mockRejectedValue(
        new Error("Failed to load savings circles from database"),
      );

      const { result } = renderHook(() => useGroups());
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "Failed to load savings circles from database",
      );
    });
  });

  describe("usePayments", () => {
    it("successfully sets payments on successful data layer response", async () => {
      vi.mocked(paymentsService.getPayments).mockResolvedValue([
        {
          id: "tx-1",
          type: "deposit",
          title: "Test Deposit",
          date: "Oct 20",
          time: "10:00 AM",
          amount: 100,
          currency: "USDC",
          status: "Completed",
        },
      ]);

      const { result } = renderHook(() => usePayments());
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toHaveLength(1);
    });

    it("surfaces real failure from data layer and populates error state", async () => {
      vi.mocked(paymentsService.getPayments).mockRejectedValue(
        new Error("Payment gateway connection reset"),
      );

      const { result } = renderHook(() => usePayments());
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "Payment gateway connection reset",
      );
    });
  });
});
