import { api, withFallback } from "./api";
import { mock } from "./mock-db";
import type { DashboardSummary } from "@/types/api";

export const dashboardService = {
  summary: () =>
    withFallback(
      async () => (await api.get<DashboardSummary>("/dashboard/summary")).data,
      () => {
        const total_co2 = +mock.carbon_transactions
          .reduce((s, t) => s + t.co2_emitted, 0)
          .toFixed(2);
        const total_participants = new Set(mock.participation.map((p) => p.employee_id)).size;
        const open_compliance_issues = mock.compliance_issues.filter((i) => i.status === "Open").length;
        const top_leaderboard = [...mock.employees]
          .sort((a, b) => b.xp_points - a.xp_points)
          .slice(0, 5)
          .map((e) => ({ name: e.name, xp_points: e.xp_points }));
        return { total_co2, total_participants, open_compliance_issues, top_leaderboard };
      },
    ),
};