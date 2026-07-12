import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, ShieldCheck, ShieldAlert, Plus, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState, ErrorBlock, SkeletonGrid } from "@/components/shared/StateViews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCloseIssue,
  useComplianceIssues,
  useCreateIssue,
  useEmployees,
} from "@/hooks/queries";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/governance")({
  head: () => ({ meta: [{ title: "Governance — EcoSphere AI" }] }),
  component: GovernancePage,
});

const schema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().optional(),
  owner_id: z.coerce.number().int().positive(),
  due_date: z.string().min(1),
});

function GovernancePage() {
  const [tab, setTab] = useState("all");
  const { data: employees } = useEmployees();
  const all = useComplianceIssues();
  const create = useCreateIssue();
  const close = useCloseIssue();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", owner_id: 1, due_date: new Date().toISOString().slice(0, 10) },
  });

  const issues = (all.data ?? []).filter((i) => {
    if (tab === "open") return i.status === "Open";
    if (tab === "closed") return i.status === "Closed";
    if (tab === "overdue") return i.is_overdue;
    return true;
  });
  const openCount = (all.data ?? []).filter((i) => i.status === "Open").length;
  const closed = (all.data ?? []).filter((i) => i.status === "Closed").length;
  const overdue = (all.data ?? []).filter((i) => i.is_overdue).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Compliance & risk"
        description="Track policy, audit and regulatory items across the organization."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open issues" value={openCount} icon={ShieldAlert} tone="governance" />
        <KpiCard label="Overdue" value={overdue} icon={AlertTriangle} tone="governance" />
        <KpiCard label="Closed" value={closed} icon={ShieldCheck} tone="primary" />
        <KpiCard label="Total tracked" value={(all.data ?? []).length} icon={ShieldCheck} tone="primary" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compliance items</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Log issue</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log compliance issue</DialogTitle></DialogHeader>
              <form
                className="space-y-3"
                onSubmit={form.handleSubmit(async (v) => {
                  try {
                    await create.mutateAsync(v);
                    toast.success("Issue logged");
                    form.reset();
                  } catch (e) {
                    toast.error(apiErrorMessage(e));
                  }
                })}
              >
                <div className="space-y-1.5"><Label>Title</Label><Input {...form.register("title")} /></div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} {...form.register("description")} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Owner</Label>
                    <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" {...form.register("owner_id")}>
                      {employees?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5"><Label>Due date</Label><Input type="date" {...form.register("due_date")} /></div>
                </div>
                <DialogFooter><Button type="submit" disabled={create.isPending}>Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              {all.isLoading ? <SkeletonGrid rows={5} /> : all.isError ? <ErrorBlock error={all.error} onRetry={() => all.refetch()} /> :
                issues.length === 0 ? <EmptyState title="No issues in this view" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="max-w-sm">
                          <div className="truncate font-medium">{i.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{i.description}</div>
                        </TableCell>
                        <TableCell>{i.owner_name ?? `#${i.owner_id}`}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{i.due_date}</span>
                            {i.is_overdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={i.status === "Open" ? "outline" : "secondary"}>{i.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          {i.status === "Open" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                try { await close.mutateAsync(i.id); toast.success("Issue closed"); }
                                catch (e) { toast.error(apiErrorMessage(e)); }
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Close
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}