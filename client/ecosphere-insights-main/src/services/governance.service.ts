import { api, withFallback } from "./api";
import { mock, nextId } from "./mock-db";
import type { ComplianceIssue } from "@/types/api";

export const governanceService = {
  list: (params?: { status?: "Open" | "Closed" }) =>
    withFallback(
      async () => (await api.get<ComplianceIssue[]>("/compliance-issues", { params })).data,
      () => {
        const today = new Date().toISOString().slice(0, 10);
        return mock.compliance_issues
          .filter((i) => !params?.status || i.status === params.status)
          .map((i) => ({ ...i, is_overdue: i.status === "Open" && i.due_date < today }));
      },
    ),
  create: (input: { title: string; description?: string; owner_id: number; due_date: string }) =>
    withFallback(
      async () => (await api.post<ComplianceIssue>("/compliance-issues", input)).data,
      () => {
        const owner = mock.employees.find((e) => e.id === input.owner_id);
        const today = new Date().toISOString().slice(0, 10);
        const issue: ComplianceIssue = {
          id: nextId("compliance_issues"),
          ...input,
          owner_name: owner?.name,
          status: "Open",
          is_overdue: input.due_date < today,
        };
        mock.compliance_issues.push(issue);
        return issue;
      },
    ),
  close: (id: number) =>
    withFallback(
      async () => (await api.patch<ComplianceIssue>(`/compliance-issues/${id}/close`)).data,
      () => {
        const i = mock.compliance_issues.find((x) => x.id === id)!;
        i.status = "Closed";
        i.is_overdue = false;
        return i;
      },
    ),
};