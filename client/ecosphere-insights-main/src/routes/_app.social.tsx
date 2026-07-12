import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, HeartHandshake, Plus, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBlock, SkeletonGrid } from "@/components/shared/StateViews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useApproveParticipation,
  useCSRActivities,
  useCreateCSRActivity,
  useJoinCSR,
  useParticipation,
  useRejectParticipation,
} from "@/hooks/queries";
import { useAuthStore } from "@/store/auth";
import { apiErrorMessage } from "@/services/api";
import type { CSRCategory } from "@/types/api";

export const Route = createFileRoute("/_app/social")({
  head: () => ({ meta: [{ title: "Social — EcoSphere AI" }] }),
  component: SocialPage,
});

const activitySchema = z.object({
  title: z.string().trim().min(3),
  category: z.enum(["Environment", "Community", "Education", "Health", "Other"]),
  description: z.string().trim().optional(),
  activity_date: z.string().min(1),
  points_value: z.coerce.number().int().positive(),
});

const catTone: Record<CSRCategory, string> = {
  Environment: "bg-env/10 text-env ring-env/25",
  Community: "bg-primary/10 text-primary ring-primary/25",
  Education: "bg-social/10 text-social ring-social/25",
  Health: "bg-destructive/10 text-destructive ring-destructive/25",
  Other: "bg-muted text-muted-foreground ring-border",
};

function SocialPage() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const activities = useCSRActivities();
  const create = useCreateCSRActivity();
  const join = useJoinCSR();
  const participation = useParticipation();
  const approve = useApproveParticipation();
  const reject = useRejectParticipation();

  const form = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      category: "Community" as const,
      description: "",
      activity_date: new Date().toISOString().slice(0, 10),
      points_value: 20,
    },
  });

  const canApprove = user && (user.role === "Admin" || user.role === "Manager");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Social"
        title="CSR & community impact"
        description="Mobilize employees, track participation, and reward action."
        actions={
          canApprove && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />New activity</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create CSR activity</DialogTitle></DialogHeader>
                <form
                  className="space-y-3"
                  onSubmit={form.handleSubmit(async (v) => {
                    try {
                      await create.mutateAsync(v);
                      toast.success("Activity created");
                      setOpen(false);
                      form.reset();
                    } catch (e) {
                      toast.error(apiErrorMessage(e));
                    }
                  })}
                >
                  <div className="space-y-1.5"><Label>Title</Label><Input {...form.register("title")} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" {...form.register("category")}>
                        {["Environment", "Community", "Education", "Health", "Other"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>Points</Label><Input type="number" {...form.register("points_value")} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Date</Label><Input type="date" {...form.register("activity_date")} /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea {...form.register("description")} rows={3} /></div>
                  <DialogFooter><Button type="submit" disabled={create.isPending}>Publish activity</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <Tabs defaultValue="activities" className="w-full">
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-4">
          {activities.isLoading ? <SkeletonGrid rows={3} /> : activities.isError ? <ErrorBlock error={activities.error} onRetry={() => activities.refetch()} /> :
            (activities.data ?? []).length === 0 ? <EmptyState title="No activities yet" /> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activities.data!.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${catTone[a.category]}`}>{a.category}</span>
                        <Badge variant="secondary">{a.points_value} XP</Badge>
                      </div>
                      <CardTitle className="mt-3 text-base leading-snug">{a.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs">
                        <CalendarDays className="h-3.5 w-3.5" /> {a.activity_date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="line-clamp-3 text-sm text-muted-foreground">{a.description ?? "Join this initiative and log your participation."}</p>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          if (!user) return;
                          try {
                            await join.mutateAsync({ activityId: a.id, employeeId: user.id });
                            toast.success("You joined — awaiting approval");
                          } catch (e) {
                            toast.error(apiErrorMessage(e));
                          }
                        }}
                      >
                        <HeartHandshake className="mr-2 h-4 w-4" /> Join activity
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending approvals</CardTitle>
              <CardDescription>Managers can approve or reject submitted participations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(participation.data ?? []).filter((p) => p.approval_status === "Pending").length === 0 ? (
                <EmptyState title="Nothing pending" description="Approvals will show up here as they come in." />
              ) : (
                (participation.data ?? []).filter((p) => p.approval_status === "Pending").map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{p.employee_name}</div>
                      <div className="text-xs text-muted-foreground">{p.activity_title}</div>
                    </div>
                    {canApprove ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={async () => { await reject.mutateAsync(p.id); toast("Rejected"); }}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" onClick={async () => { await approve.mutateAsync(p.id); toast.success("Approved — XP awarded"); }}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                        </Button>
                      </div>
                    ) : <Badge variant="outline">Pending</Badge>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Participation timeline</CardTitle></CardHeader>
            <CardContent>
              {(participation.data ?? []).length === 0 ? <EmptyState title="No history yet" /> : (
                <ol className="relative space-y-4 border-l border-border pl-4">
                  {(participation.data ?? []).map((p) => (
                    <li key={p.id} className="relative">
                      <span className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ring-2 ring-background ${p.approval_status === "Approved" ? "bg-primary" : p.approval_status === "Rejected" ? "bg-destructive" : "bg-muted-foreground"}`} />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium">{p.activity_title}</div>
                          <div className="text-xs text-muted-foreground">{p.employee_name} • {p.completion_date ?? "in review"}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={p.approval_status === "Approved" ? "secondary" : p.approval_status === "Rejected" ? "destructive" : "outline"}>
                            {p.approval_status}
                          </Badge>
                          {p.points_earned > 0 && <Badge className="bg-primary/15 text-primary hover:bg-primary/20">+{p.points_earned} XP</Badge>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}