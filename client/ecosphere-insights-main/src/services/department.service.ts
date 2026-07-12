import { api, withFallback } from "./api";
import { mock, nextId } from "./mock-db";
import type { Department } from "@/types/api";

export const departmentService = {
  list: () =>
    withFallback(
      async () => (await api.get<Department[]>("/departments")).data,
      () => [...mock.departments],
    ),
  create: (input: { name: string; code: string }) =>
    withFallback(
      async () => (await api.post<Department>("/departments", input)).data,
      () => {
        const d: Department = { id: nextId("departments"), status: "Active", ...input };
        mock.departments.push(d);
        return d;
      },
    ),
};