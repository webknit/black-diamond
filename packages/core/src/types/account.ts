export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  /** All money funded into the bankroll, including the initial deposit. */
  totalDeposits: number;
  currentBalance: number;
  currency: "GBP";
  createdAt: string;
  updatedAt: string;
};
