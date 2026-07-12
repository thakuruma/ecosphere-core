import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";
import { employeeService } from "@/services/employee.service";
import { environmentService } from "@/services/environment.service";
import { csrService } from "@/services/csr.service";
import { governanceService } from "@/services/governance.service";
import { dashboardService } from "@/services/dashboard.service";
import { leaderboardService } from "@/services/leaderboard.service";
import type { Role } from "@/types/api";

/* Departments */
export const useDepartments = () =>
  useQuery({ queryKey: ["departments"], queryFn: () => departmentService.list() });
export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; code: string }) => departmentService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
};

/* Employees */
export const useEmployees = (params?: { department_id?: number; status?: string }) =>
  useQuery({ queryKey: ["employees", params], queryFn: () => employeeService.list(params) });
export const useUpdateEmployeeRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => employeeService.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};
export const useEmployeeBadges = (id?: number) =>
  useQuery({
    queryKey: ["employee-badges", id],
    queryFn: () => employeeService.badges(id!),
    enabled: !!id,
  });

/* Environment */
export const useEmissionFactors = () =>
  useQuery({ queryKey: ["emission-factors"], queryFn: () => environmentService.listEmissionFactors() });
export const useCreateEmissionFactor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: environmentService.createEmissionFactor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factors"] }),
  });
};
export const useCarbonTransactions = (params?: {
  department_id?: number;
  from?: string;
  to?: string;
}) =>
  useQuery({
    queryKey: ["carbon-transactions", params],
    queryFn: () => environmentService.listTransactions(params),
  });
export const useCreateCarbonTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: environmentService.createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carbon-transactions"] });
      qc.invalidateQueries({ queryKey: ["emissions-summary"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};
export const useEmissionsSummary = () =>
  useQuery({ queryKey: ["emissions-summary"], queryFn: () => environmentService.emissionsSummary() });

/* CSR */
export const useCSRActivities = () =>
  useQuery({ queryKey: ["csr-activities"], queryFn: () => csrService.listActivities() });
export const useCreateCSRActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: csrService.createActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["csr-activities"] }),
  });
};
export const useJoinCSR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { activityId: number; employeeId: number; proof_url?: string }) =>
      csrService.join(v.activityId, v.employeeId, v.proof_url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["participation"] }),
  });
};
export const useParticipation = (employee_id?: number) =>
  useQuery({
    queryKey: ["participation", employee_id],
    queryFn: () => csrService.listParticipation(employee_id ? { employee_id } : undefined),
  });
export const useApproveParticipation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => csrService.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["participation"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
};
export const useRejectParticipation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => csrService.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["participation"] }),
  });
};

/* Governance */
export const useComplianceIssues = (status?: "Open" | "Closed") =>
  useQuery({
    queryKey: ["compliance-issues", status],
    queryFn: () => governanceService.list(status ? { status } : undefined),
  });
export const useCreateIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: governanceService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance-issues"] }),
  });
};
export const useCloseIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => governanceService.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance-issues"] }),
  });
};

/* Dashboard & Leaderboard */
export const useDashboardSummary = () =>
  useQuery({ queryKey: ["dashboard-summary"], queryFn: () => dashboardService.summary() });
export const useLeaderboard = () =>
  useQuery({ queryKey: ["leaderboard"], queryFn: () => leaderboardService.list() });
export const useBadges = () =>
  useQuery({ queryKey: ["badges"], queryFn: () => leaderboardService.badges() });