export type BillState = 'Submitted' | 'Faculty_Verified' | 'Manager_Approved' | 'Disputed';

export interface BillItem {
  id: string;
  studentId: string;
  studentName: string;
  departmentId: string;
  month: string;
  hoursCompleted: number;
  hourlyRate: number; // e.g. $15/hr
  totalPayout: number;
  state: BillState;
  submittedAt: string;
  verifiedByFaculty?: string;
  approvedByManager?: string;
  disputeReason?: string;
}

export interface BillSubmitPayload {
  month: string;
  hoursCompleted: number;
}
