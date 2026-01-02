export interface CashRequest {
  id: string;
  budget_id: string | null;
  amount: number;
  purpose: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
  created_by: string;
  created_at: string;
}
