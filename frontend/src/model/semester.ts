export interface Semester {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  is_onboarding_open: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface SemesterStats {
  semester_id: number;
  semester_name: string;
  onboarded_students_count: number;
  total_duties_count: number;
  total_claims_count: number;
  is_active: boolean;
  is_onboarding_open: boolean;
}

export interface CreateSemesterPayload {
  name: string;
  code: string;
  is_active?: boolean;
  is_onboarding_open?: boolean;
  start_date?: string;
  end_date?: string;
}
