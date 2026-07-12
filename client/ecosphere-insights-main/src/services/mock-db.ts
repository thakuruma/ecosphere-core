import type {
  Badge,
  CSRActivity,
  CarbonTransaction,
  ComplianceIssue,
  Department,
  EmissionFactor,
  Employee,
  Participation,
} from "@/types/api";

// Seeded in-memory dataset — used only when the backend is unreachable.
export const mock = {
  departments: [
    { id: 1, name: "Operations", code: "OPS", head_name: "Rahul Menon", status: "Active" },
    { id: 2, name: "Engineering", code: "ENG", head_name: "Ayesha Rao", status: "Active" },
    { id: 3, name: "Marketing", code: "MKT", head_name: "David Park", status: "Active" },
    { id: 4, name: "Human Resources", code: "HR", head_name: "Lena Kaur", status: "Active" },
  ] as Department[],
  employees: [
    { id: 1, name: "Priya Shah", email: "priya@ecosphere.ai", role: "Employee", department_id: 2, department: "Engineering", status: "Active", xp_points: 340 },
    { id: 2, name: "Rahul Menon", email: "rahul@ecosphere.ai", role: "Manager", department_id: 1, department: "Operations", status: "Active", xp_points: 280 },
    { id: 3, name: "Ayesha Rao", email: "ayesha@ecosphere.ai", role: "Manager", department_id: 2, department: "Engineering", status: "Active", xp_points: 410 },
    { id: 4, name: "David Park", email: "david@ecosphere.ai", role: "Manager", department_id: 3, department: "Marketing", status: "Active", xp_points: 190 },
    { id: 5, name: "Lena Kaur", email: "lena@ecosphere.ai", role: "Admin", department_id: 4, department: "Human Resources", status: "Active", xp_points: 520 },
    { id: 6, name: "Marco Silva", email: "marco@ecosphere.ai", role: "Employee", department_id: 1, department: "Operations", status: "Active", xp_points: 120 },
    { id: 7, name: "Nina Patel", email: "nina@ecosphere.ai", role: "Employee", department_id: 3, department: "Marketing", status: "Active", xp_points: 220 },
    { id: 8, name: "Sofia Chen", email: "sofia@ecosphere.ai", role: "Employee", department_id: 2, department: "Engineering", status: "Inactive", xp_points: 60 },
  ] as Employee[],
  emission_factors: [
    { id: 1, activity_name: "Electricity", unit: "kWh", co2_per_unit: 0.42 },
    { id: 2, activity_name: "Natural Gas", unit: "m3", co2_per_unit: 1.9 },
    { id: 3, activity_name: "Diesel", unit: "L", co2_per_unit: 2.68 },
    { id: 4, activity_name: "Air Travel (short-haul)", unit: "km", co2_per_unit: 0.15 },
    { id: 5, activity_name: "Paper", unit: "kg", co2_per_unit: 0.94 },
  ] as EmissionFactor[],
  carbon_transactions: [
    { id: 1, department_id: 1, department: "Operations", emission_factor_id: 1, activity_name: "Electricity", quantity: 800, co2_emitted: 336, transaction_date: "2026-07-01" },
    { id: 2, department_id: 2, department: "Engineering", emission_factor_id: 1, activity_name: "Electricity", quantity: 210, co2_emitted: 88.2, transaction_date: "2026-07-02" },
    { id: 3, department_id: 1, department: "Operations", emission_factor_id: 2, activity_name: "Natural Gas", quantity: 35, co2_emitted: 66.5, transaction_date: "2026-07-05" },
    { id: 4, department_id: 3, department: "Marketing", emission_factor_id: 4, activity_name: "Air Travel (short-haul)", quantity: 620, co2_emitted: 93, transaction_date: "2026-07-06" },
    { id: 5, department_id: 2, department: "Engineering", emission_factor_id: 5, activity_name: "Paper", quantity: 40, co2_emitted: 37.6, transaction_date: "2026-07-08" },
  ] as CarbonTransaction[],
  csr_activities: [
    { id: 1, title: "Beach Cleanup — Marina Bay", category: "Environment", description: "Community shoreline cleanup with local NGO.", activity_date: "2026-07-20", points_value: 30 },
    { id: 2, title: "STEM Mentorship Day", category: "Education", description: "Mentor high-school students on career pathways.", activity_date: "2026-07-25", points_value: 25 },
    { id: 3, title: "Blood Donation Camp", category: "Health", description: "On-site donation drive with Red Cross.", activity_date: "2026-08-02", points_value: 40 },
    { id: 4, title: "Tree Plantation", category: "Environment", description: "Plant 500 native saplings.", activity_date: "2026-08-10", points_value: 35 },
  ] as CSRActivity[],
  participation: [
    { id: 1, employee_id: 1, employee_name: "Priya Shah", activity_id: 1, activity_title: "Beach Cleanup — Marina Bay", approval_status: "Approved", points_earned: 30, completion_date: "2026-07-20" },
    { id: 2, employee_id: 2, employee_name: "Rahul Menon", activity_id: 2, activity_title: "STEM Mentorship Day", approval_status: "Pending", points_earned: 0 },
    { id: 3, employee_id: 6, employee_name: "Marco Silva", activity_id: 1, activity_title: "Beach Cleanup — Marina Bay", approval_status: "Pending", points_earned: 0 },
    { id: 4, employee_id: 3, employee_name: "Ayesha Rao", activity_id: 3, activity_title: "Blood Donation Camp", approval_status: "Approved", points_earned: 40, completion_date: "2026-06-15" },
  ] as Participation[],
  badges: [
    { id: 1, name: "First Step", description: "Earn your first 50 XP", unlock_xp_threshold: 50 },
    { id: 2, name: "Green Advocate", description: "Reach 150 XP", unlock_xp_threshold: 150 },
    { id: 3, name: "Impact Maker", description: "Reach 300 XP", unlock_xp_threshold: 300 },
    { id: 4, name: "Sustainability Champion", description: "Reach 500 XP", unlock_xp_threshold: 500 },
  ] as Badge[],
  compliance_issues: [
    { id: 1, title: "Missing ISO 14001 evidence", description: "Q2 audit pack incomplete.", owner_id: 5, owner_name: "Lena Kaur", due_date: "2026-07-10", status: "Open", is_overdue: true },
    { id: 2, title: "Supplier code-of-conduct renewals", description: "5 vendors pending re-sign.", owner_id: 2, owner_name: "Rahul Menon", due_date: "2026-08-01", status: "Open", is_overdue: false },
    { id: 3, title: "Data privacy training completion", description: "Engineering team below 90%.", owner_id: 3, owner_name: "Ayesha Rao", due_date: "2026-07-28", status: "Open", is_overdue: false },
    { id: 4, title: "Fire-safety cert renewal", description: "Building B expired March.", owner_id: 2, owner_name: "Rahul Menon", due_date: "2026-06-01", status: "Closed", is_overdue: false },
  ] as ComplianceIssue[],
};

let nextIds: Record<string, number> = {};
export function nextId(key: keyof typeof mock): number {
  const arr = mock[key] as unknown as { id: number }[];
  if (!nextIds[key]) nextIds[key] = Math.max(0, ...arr.map((r) => r.id)) + 1;
  else nextIds[key] += 1;
  return nextIds[key];
}