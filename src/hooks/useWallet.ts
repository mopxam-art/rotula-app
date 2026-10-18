import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { walletService, type WalletData } from "@/services/api/wallet";

export type { WalletData };

export const useWallet = () => {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }

    let mounted = true;
    const fetchWallet = async () => {
      try {
        setIsLoading(true);
        const wallet = await walletService.getWallet();
        if (mounted) {
          setData(wallet);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch wallet data"),
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    fetchWallet();
    return () => {
      mounted = false;
    };
  }, [user]);

  return { data, isLoading, error };
};
