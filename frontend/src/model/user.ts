export type UserRole = 'Student' | 'Faculty' | 'LabManager' | 'DeptManager';

export interface User {
  id: string;
  department_id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  rfidTag?: string;
  weekly_hours_limit?: number;
  approval_status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface RegisterRequest {
  department_id: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  rfidTag?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiErrorResponse {
  detail: string;
}
