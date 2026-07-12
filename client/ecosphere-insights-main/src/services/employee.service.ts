import { api, withFallback } from "./api";
import { mock } from "./mock-db";
import type { Employee, Role } from "@/types/api";

export const employeeService = {
  list: (params?: { department_id?: number; status?: string }) =>
    withFallback(
      async () => (await api.get<Employee[]>("/employees", { params })).data,
      () =>
        mock.employees.filter(
          (e) =>
            (!params?.department_id || e.department_id === params.department_id) &&
            (!params?.status || e.status === params.status),
        ),
    ),
  updateRole: (id: number, role: Role) =>
    withFallback(
      async () => (await api.patch<Employee>(`/employees/${id}/role`, { role })).data,
      () => {
        const emp = mock.employees.find((e) => e.id === id);
        if (!emp) throw new Error("Not found");
        emp.role = role;
        return emp;
      },
    ),
  badges: (id: number) =>
    withFallback(
      async () => (await api.get(`/employees/${id}/badges`)).data,
      () => {
        const emp = mock.employees.find((e) => e.id === id);
        const xp = emp?.xp_points ?? 0;
        return mock.badges.filter((b) => b.unlock_xp_threshold <= xp);
      },
    ),
};