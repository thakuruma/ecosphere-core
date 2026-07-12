import { api, withFallback } from "./api";
import { mock, nextId } from "./mock-db";
import type { CarbonTransaction, EmissionFactor, EmissionsSummary } from "@/types/api";

export const environmentService = {
  listEmissionFactors: () =>
    withFallback(
      async () => (await api.get<EmissionFactor[]>("/emission-factors")).data,
      () => [...mock.emission_factors],
    ),
  createEmissionFactor: (input: Omit<EmissionFactor, "id">) =>
    withFallback(
      async () => (await api.post<EmissionFactor>("/emission-factors", input)).data,
      () => {
        const f = { id: nextId("emission_factors"), ...input };
        mock.emission_factors.push(f);
        return f;
      },
    ),
  listTransactions: (params?: { department_id?: number; from?: string; to?: string }) =>
    withFallback(
      async () => (await api.get<CarbonTransaction[]>("/carbon-transactions", { params })).data,
      () =>
        mock.carbon_transactions.filter((t) => {
          if (params?.department_id && t.department_id !== params.department_id) return false;
          if (params?.from && t.transaction_date < params.from) return false;
          if (params?.to && t.transaction_date > params.to) return false;
          return true;
        }),
    ),
  createTransaction: (input: {
    department_id: number;
    emission_factor_id: number;
    quantity: number;
    transaction_date: string;
  }) =>
    withFallback(
      async () => (await api.post<CarbonTransaction>("/carbon-transactions", input)).data,
      () => {
        const f = mock.emission_factors.find((x) => x.id === input.emission_factor_id);
        const d = mock.departments.find((x) => x.id === input.department_id);
        if (!f || !d) throw new Error("Invalid factor or department");
        const t: CarbonTransaction = {
          id: nextId("carbon_transactions"),
          department_id: d.id,
          department: d.name,
          emission_factor_id: f.id,
          activity_name: f.activity_name,
          quantity: input.quantity,
          co2_emitted: +(input.quantity * f.co2_per_unit).toFixed(2),
          transaction_date: input.transaction_date,
        };
        mock.carbon_transactions.push(t);
        return t;
      },
    ),
  emissionsSummary: () =>
    withFallback(
      async () => (await api.get<EmissionsSummary[]>("/dashboard/emissions-summary")).data,
      () => {
        const byDept = new Map<string, number>();
        for (const t of mock.carbon_transactions) {
          const key = t.department ?? String(t.department_id);
          byDept.set(key, (byDept.get(key) ?? 0) + t.co2_emitted);
        }
        return Array.from(byDept, ([department, total_co2]) => ({
          department,
          total_co2: +total_co2.toFixed(2),
        }));
      },
    ),
};