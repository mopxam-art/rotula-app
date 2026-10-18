export interface WalletData {
  balance: number;
  currency: string;
  trendPercentage: number;
}

export const walletService = {
  async getWallet(): Promise<WalletData> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      balance: 12450.0,
      currency: "USDC",
      trendPercentage: 2.4,
    };
  },
};
