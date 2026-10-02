export type BillState = 'Submitted' | 'Faculty_Verified' | 'Manager_Approved' | 'Paid' | 'Disputed';

export interface BillItem {
  id: string;
  studentId: string;
  studentName: string;
  departmentId: string;
  month: string;
  weekNumber?: number;
  hoursCompleted: number;
  hourlyRate: number; // e.g. $15/hr or BDT
  totalPayout: number;
  state: BillState;
  submittedAt: string;
  verifiedByFaculty?: string;
  verifiedAt?: string;
  approvedByManager?: string;
  approvedAt?: string;
  paidBy?: string;
  paidAt?: string;
  disputeReason?: string;
  semester?: string;
}

export interface BillSubmitPayload {
  month: string;
  hoursCompleted: number;
  weekNumber?: number;
  semester?: string;
}

export interface ManualBillPayload {
  studentId: string;
  month: string;
  weekNumber?: number;
  hoursCompleted: number;
  hourlyRate?: number;
  semester?: string;
}
