import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Leaf, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin, useSignup } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/queries";
import { useAuthStore } from "@/store/auth";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — EcoSphere AI" },
      { name: "description", content: "Sign in to the EcoSphere AI ESG operations cloud." },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  department_id: z.coerce.number().int().positive("Choose a department"),
});

function AuthPage() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && user) navigate({ to: "/" });
  }, [hydrated, user, navigate]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside
          className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">EcoSphere AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <Leaf className="h-3.5 w-3.5" /> ESG Operations Cloud
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
              Run your ESG program like a product team.
            </h1>
            <p className="mt-4 text-white/70">
              Measure carbon. Mobilize CSR. Close compliance gaps. Reward the people making it happen —
              all inside one polished, AI-native workspace.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              {[
                ["Emissions tracked", "12.4M kg"],
                ["Programs live", "148"],
                ["Companies", "60+"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <div className="text-lg font-semibold">{v}</div>
                  <div className="text-white/60">{k}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-xs text-white/50">© {new Date().getFullYear()} EcoSphere AI</div>
        </aside>

        <main className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-semibold tracking-tight">EcoSphere AI</span>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm />
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Backend not running? The app falls back to a rich demo dataset so you can explore every module.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginForm() {
  const login = useLogin();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "lena@ecosphere.ai", password: "Secret123" },
  });
  return (
    <form
      onSubmit={form.handleSubmit(async (v) => {
        try {
          await login.mutateAsync(v);
          toast.success("Signed in");
        } catch (e) {
          toast.error(apiErrorMessage(e));
        }
      })}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

function SignupForm() {
  const signup = useSignup();
  const { data: departments } = useDepartments();
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", department_id: 1 },
  });
  return (
    <form
      onSubmit={form.handleSubmit(async (v) => {
        try {
          await signup.mutateAsync(v);
          toast.success("Account created");
        } catch (e) {
          toast.error(apiErrorMessage(e));
        }
      })}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Work email</Label>
        <Input id="signup-email" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-pass">Password</Label>
        <Input id="signup-pass" type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="dept">Department</Label>
        <select
          id="dept"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          {...form.register("department_id")}
        >
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={signup.isPending}>
        {signup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}