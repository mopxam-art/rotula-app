import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { paymentsService, type Transaction } from "@/services/api/payments";

export type { Transaction };

export const usePayments = () => {
  const [data, setData] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }

    let mounted = true;
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const payments = await paymentsService.getPayments();
        if (mounted) {
          setData(payments);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch payments data"),
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    fetchPayments();
    return () => {
      mounted = false;
    };
  }, [user]);

  return { data, isLoading, error };
};
