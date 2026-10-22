export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  startingBalance: number;
  currentBalance: number;
  currency: "GBP";
  createdAt: string;
  updatedAt: string;
};
