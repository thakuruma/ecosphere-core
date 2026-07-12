import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Trophy } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth";
import { useEmployeeBadges, useParticipation } from "@/hooks/queries";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — EcoSphere AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const badges = useEmployeeBadges(user?.id);
  const participation = useParticipation(user?.id);
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "EA";
  const xp = user?.xp_points ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Your profile" description="Your ESG contribution and unlocked achievements." />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar>
            <CardTitle className="mt-3">{user?.name}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">{user?.role}</Badge>
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20"><Trophy className="mr-1 h-3 w-3" />{xp} XP</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress to next tier</span><span>{xp}/600 XP</span>
              </div>
              <Progress value={Math.min(100, (xp / 600) * 100)} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Your badges</CardTitle>
              <CardDescription>Unlocked as you contribute.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(badges.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No badges yet — join a CSR activity to get started.</p> :
                (badges.data ?? []).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.description}</div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent participation</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(participation.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No participation history yet.</p> :
                (participation.data ?? []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <div className="text-sm font-medium">{p.activity_title}</div>
                      <div className="text-xs text-muted-foreground">{p.completion_date ?? "In review"}</div>
                    </div>
                    <Badge variant={p.approval_status === "Approved" ? "secondary" : p.approval_status === "Rejected" ? "destructive" : "outline"}>
                      {p.approval_status}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}