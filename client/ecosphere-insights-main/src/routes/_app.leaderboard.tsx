import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Crown, Sparkles, Trophy } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBlock, SkeletonGrid } from "@/components/shared/StateViews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBadges, useLeaderboard } from "@/hooks/queries";

export const Route = createFileRoute("/_app/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — EcoSphere AI" }] }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const lb = useLeaderboard();
  const badges = useBadges();
  const max = Math.max(1, ...(lb.data ?? []).map((x) => x.xp_points));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gamification"
        title="Leaderboard & badges"
        description="Celebrate the people driving your ESG programs forward."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Top contributors</CardTitle>
            <CardDescription>Ranked by XP earned from CSR participation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lb.isLoading ? <SkeletonGrid rows={5} /> : lb.isError ? <ErrorBlock error={lb.error} onRetry={() => lb.refetch()} /> :
              (lb.data ?? []).length === 0 ? <EmptyState title="No scores yet" /> :
              lb.data!.map((e, i) => {
                const initials = e.name.split(" ").map((x) => x[0]).slice(0, 2).join("");
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                    </span>
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{e.name}</span>
                        <span className="text-xs text-muted-foreground">{e.xp_points} XP • {e.badge_count} badges</span>
                      </div>
                      <Progress value={(e.xp_points / max) * 100} className="mt-2 h-1.5" />
                    </div>
                  </motion.div>
                );
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Badge library</CardTitle>
            <CardDescription>Unlockable across the XP ladder.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(badges.data ?? []).map((b) => (
              <div key={b.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{b.name}</span>
                    <Badge variant="outline" className="text-[10px]">{b.unlock_xp_threshold} XP</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}