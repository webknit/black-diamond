export type BalanceTransactionType =
  | "opening_balance"
  | "deposit"
  | "bet_stake"
  | "bet_payout"
  | "bet_reversal"
  | "adjustment";

export type BalanceTransaction = {
  id: string;
  accountId: string;
  type: BalanceTransactionType;
  amount: number;
  balanceAfter: number;
  occurredAt: string;
  referenceId: string | null;
};
