import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBlock, SkeletonGrid } from "@/components/shared/StateViews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDepartments, useEmployees, useUpdateEmployeeRole } from "@/hooks/queries";
import type { Employee, Role } from "@/types/api";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/employees")({
  head: () => ({ meta: [{ title: "Employees — EcoSphere AI" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [newRole, setNewRole] = useState<Role>("Employee");

  const { data: departments } = useDepartments();
  const { data, isLoading, isError, error, refetch } = useEmployees({
    department_id: dept === "all" ? undefined : Number(dept),
    status: status === "all" ? undefined : status,
  });
  const update = useUpdateEmployeeRole();

  const filtered = (data ?? []).filter(
    (e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Employees"
        description="Roles, XP and participation across your organization."
      />

      <Card>
        <CardHeader className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonGrid rows={5} />
          ) : isError ? (
            <ErrorBlock error={error} onRetry={() => refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No employees found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const initials = e.name.split(" ").map((x) => x[0]).slice(0, 2).join("");
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{e.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{e.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{e.department ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline">{e.role}</Badge></TableCell>
                      <TableCell className="w-40">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(100, (e.xp_points / 600) * 100)} className="h-1.5" />
                          <span className="text-xs text-muted-foreground">{e.xp_points}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={e.status === "Active" ? "secondary" : "outline"}>{e.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(e); setNewRole(e.role); }}>Change role</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update role — {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!editing) return;
                try {
                  await update.mutateAsync({ id: editing.id, role: newRole });
                  toast.success("Role updated");
                  setEditing(null);
                } catch (e) {
                  toast.error(apiErrorMessage(e));
                }
              }}
              disabled={update.isPending}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}