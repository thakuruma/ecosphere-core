export type Role = "Admin" | "Manager" | "Employee";
export type Status = "Active" | "Inactive";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  department_id?: number;
  xp_points?: number;
  token?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  head_name?: string;
  status: Status;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  department_id: number;
  department?: string;
  status: Status;
  xp_points: number;
}

export interface EmissionFactor {
  id: number;
  activity_name: string;
  unit: string;
  co2_per_unit: number;
}

export interface CarbonTransaction {
  id: number;
  department_id: number;
  department?: string;
  emission_factor_id: number;
  activity_name?: string;
  quantity: number;
  co2_emitted: number;
  transaction_date: string;
}

export interface EmissionsSummary {
  department: string;
  total_co2: number;
}

export type CSRCategory = "Environment" | "Community" | "Education" | "Health" | "Other";
export interface CSRActivity {
  id: number;
  title: string;
  category: CSRCategory;
  description?: string;
  activity_date: string;
  points_value: number;
}

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";
export interface Participation {
  id: number;
  employee_id: number;
  employee_name?: string;
  activity_id: number;
  activity_title?: string;
  proof_url?: string;
  approval_status: ApprovalStatus;
  points_earned: number;
  completion_date?: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  unlock_xp_threshold: number;
  icon_url?: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  xp_points: number;
  badge_count: number;
}

export interface ComplianceIssue {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  owner_name?: string;
  due_date: string;
  status: "Open" | "Closed";
  is_overdue: boolean;
}

export interface DashboardSummary {
  total_co2: number;
  total_participants: number;
  open_compliance_issues: number;
  top_leaderboard: Array<{ name: string; xp_points: number }>;
}

export interface ApiError {
  error: string;
}