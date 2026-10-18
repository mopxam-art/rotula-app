export interface Transaction {
  id: string;
  type: "deposit" | "contribution" | "send";
  title: string;
  date: string;
  time: string;
  amount: number;
  currency: string;
  status: string;
}

export const paymentsService = {
  async getPayments(): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [
      {
        id: "1",
        type: "deposit",
        title: "Deposit from WhatsApp Pay",
        date: "Oct 21, 2023",
        time: "2:30 PM",
        amount: 250.0,
        currency: "USDC",
        status: "Completed",
      },
      {
        id: "2",
        type: "contribution",
        title: "Home Fund Contribution",
        date: "Oct 19, 2023",
        time: "9:15 AM",
        amount: -100.0,
        currency: "USDC",
        status: "Completed",
      },
      {
        id: "3",
        type: "send",
        title: "Sent to Sarah K.",
        date: "Oct 18, 2023",
        time: "11:45 PM",
        amount: -55.2,
        currency: "USDC",
        status: "Completed",
      },
    ];
  },
};
