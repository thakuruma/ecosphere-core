import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBlock, SkeletonGrid } from "@/components/shared/StateViews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateDepartment, useDepartments } from "@/hooks/queries";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Departments — EcoSphere AI" }] }),
  component: DepartmentsPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  code: z.string().trim().min(2, "Code is required").max(8),
});

function DepartmentsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useDepartments();
  const create = useCreateDepartment();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", code: "" } });

  const filtered = (data ?? []).filter(
    (d) =>
      d.name.toLowerCase().includes(q.toLowerCase()) || d.code.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Departments"
        description="Manage the org structure powering every ESG program."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create department</DialogTitle>
                <DialogDescription>Add a new business unit to your organization.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (v) => {
                  try {
                    await create.mutateAsync(v);
                    toast.success("Department created");
                    form.reset();
                    setOpen(false);
                  } catch (e) {
                    toast.error(apiErrorMessage(e));
                  }
                })}
              >
                <div className="space-y-2">
                  <Label htmlFor="d-name">Name</Label>
                  <Input id="d-name" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-code">Code</Label>
                  <Input id="d-code" {...form.register("code")} placeholder="e.g. FIN" />
                  {form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={create.isPending}>Create department</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).slice(0, 4).map((d) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><Building2 className="h-4 w-4" /></div>
                <Badge variant={d.status === "Active" ? "secondary" : "outline"}>{d.status}</Badge>
              </div>
              <CardTitle className="mt-3 text-base">{d.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <div>Code: <span className="font-medium text-foreground">{d.code}</span></div>
              <div>Head: <span className="font-medium text-foreground">{d.head_name ?? "—"}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All departments</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonGrid />
          ) : isError ? (
            <ErrorBlock error={error} onRetry={() => refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No departments" description="Create your first department to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="outline">{d.code}</Badge></TableCell>
                    <TableCell>{d.head_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "Active" ? "secondary" : "outline"}>{d.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}