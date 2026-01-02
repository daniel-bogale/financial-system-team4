export interface Expense {
  id: string;
  budget_id: string | null;
  amount: number;
  category: string | null;
  verified: boolean | null;
  created_by: string;
  created_at: string;
}
