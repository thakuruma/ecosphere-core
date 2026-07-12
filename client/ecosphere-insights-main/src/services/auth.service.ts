import { api, withFallback } from "./api";
import { mock } from "./mock-db";
import type { AuthUser } from "@/types/api";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  department_id: number;
}
export interface LoginInput {
  email: string;
  password: string;
}

function fakeToken(email: string) {
  return `mock.${btoa(email)}.${Date.now()}`;
}

export const authService = {
  signup: (input: SignupInput) =>
    withFallback(
      async () => (await api.post<AuthUser>("/auth/signup", input)).data,
      () => {
        const id = mock.employees.length + 1;
        const user: AuthUser = {
          id,
          name: input.name,
          email: input.email,
          role: "Employee",
          department_id: input.department_id,
          xp_points: 0,
          token: fakeToken(input.email),
        };
        mock.employees.push({
          id,
          name: input.name,
          email: input.email,
          role: "Employee",
          department_id: input.department_id,
          department: mock.departments.find((d) => d.id === input.department_id)?.name,
          status: "Active",
          xp_points: 0,
        });
        return user;
      },
    ),

  login: (input: LoginInput) =>
    withFallback(
      async () => (await api.post<AuthUser>("/auth/login", input)).data,
      () => {
        const emp = mock.employees.find((e) => e.email.toLowerCase() === input.email.toLowerCase());
        const base = emp ?? mock.employees[4]; // default to admin Lena
        return {
          id: base.id,
          name: base.name,
          email: base.email,
          role: base.role,
          department_id: base.department_id,
          xp_points: base.xp_points,
          token: fakeToken(base.email),
        } as AuthUser;
      },
    ),

  me: () =>
    withFallback(
      async () => (await api.get<AuthUser>("/auth/me")).data,
      () => {
        const raw = typeof window !== "undefined" ? localStorage.getItem("ecosphere_user") : null;
        if (!raw) throw new Error("No session");
        return JSON.parse(raw) as AuthUser;
      },
    ),
};