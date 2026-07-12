import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type LoginInput, type SignupInput } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "@tanstack/react-router";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (user) => {
      setSession(user);
      qc.invalidateQueries();
      navigate({ to: "/" });
    },
  });
}

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: SignupInput) => authService.signup(input),
    onSuccess: (user) => {
      setSession(user);
      navigate({ to: "/" });
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return () => {
    clear();
    qc.clear();
    navigate({ to: "/auth" });
  };
}