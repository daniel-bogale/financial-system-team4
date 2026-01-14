export interface Expense {
  id: string;
  budget_id: string | null;
  amount: number;
  category: string | null;
  verified: boolean | null;
  receipt_url: string | null;
  created_by: string;
  created_at: string;
}
