export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  startingBalance: number;
  totalDeposits: number;
  currentBalance: number;
  currency: "GBP";
  createdAt: string;
  updatedAt: string;
};
