import { api, withFallback } from "./api";
import { mock, nextId } from "./mock-db";
import type { CSRActivity, Participation } from "@/types/api";

export const csrService = {
  listActivities: () =>
    withFallback(
      async () => (await api.get<CSRActivity[]>("/csr-activities")).data,
      () => [...mock.csr_activities],
    ),
  createActivity: (input: Omit<CSRActivity, "id">) =>
    withFallback(
      async () => (await api.post<CSRActivity>("/csr-activities", input)).data,
      () => {
        const a = { id: nextId("csr_activities"), ...input };
        mock.csr_activities.push(a);
        return a;
      },
    ),
  join: (activityId: number, employeeId: number, proof_url?: string) =>
    withFallback(
      async () =>
        (await api.post<Participation>(`/csr-activities/${activityId}/join`, { proof_url })).data,
      () => {
        if (mock.participation.some((p) => p.activity_id === activityId && p.employee_id === employeeId)) {
          const err: any = new Error("You have already joined this activity");
          err.response = { status: 409, data: { error: "Already joined" } };
          throw err;
        }
        const act = mock.csr_activities.find((a) => a.id === activityId)!;
        const emp = mock.employees.find((e) => e.id === employeeId)!;
        const p: Participation = {
          id: nextId("participation"),
          employee_id: employeeId,
          employee_name: emp?.name,
          activity_id: activityId,
          activity_title: act?.title,
          proof_url,
          approval_status: "Pending",
          points_earned: 0,
        };
        mock.participation.push(p);
        return p;
      },
    ),
  listParticipation: (params?: { employee_id?: number }) =>
    withFallback(
      async () => (await api.get<Participation[]>("/participation", { params })).data,
      () =>
        mock.participation.filter(
          (p) => !params?.employee_id || p.employee_id === params.employee_id,
        ),
    ),
  approve: (participationId: number) =>
    withFallback(
      async () => (await api.patch<Participation>(`/participation/${participationId}/approve`)).data,
      () => {
        const p = mock.participation.find((x) => x.id === participationId)!;
        const act = mock.csr_activities.find((a) => a.id === p.activity_id)!;
        p.approval_status = "Approved";
        p.points_earned = act.points_value;
        p.completion_date = new Date().toISOString().slice(0, 10);
        const emp = mock.employees.find((e) => e.id === p.employee_id);
        if (emp) emp.xp_points += act.points_value;
        return p;
      },
    ),
  reject: (participationId: number) =>
    withFallback(
      async () => (await api.patch<Participation>(`/participation/${participationId}/reject`)).data,
      () => {
        const p = mock.participation.find((x) => x.id === participationId)!;
        p.approval_status = "Rejected";
        p.points_earned = 0;
        return p;
      },
    ),
};