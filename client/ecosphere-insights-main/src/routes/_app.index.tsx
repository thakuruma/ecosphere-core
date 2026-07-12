import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cloud, Trophy, ShieldAlert, Users2, Sparkles, ArrowUpRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { ErrorBlock, LoadingBlock } from "@/components/shared/StateViews";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useDashboardSummary,
  useEmissionsSummary,
  useCarbonTransactions,
  useComplianceIssues,
} from "@/hooks/queries";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EcoSphere AI" },
      { name: "description", content: "Real-time ESG performance across your organization." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const summary = useDashboardSummary();
  const emissions = useEmissionsSummary();
  const tx = useCarbonTransactions();
  const issues = useComplianceIssues("Open");

  const trend = (tx.data ?? [])
    .slice()
    .sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
    .reduce<Array<{ date: string; co2: number }>>((acc, t) => {
      const last = acc[acc.length - 1];
      const prev = last?.co2 ?? 0;
      acc.push({ date: t.transaction_date.slice(5), co2: +(prev + t.co2_emitted).toFixed(1) });
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command center"
        title="Sustainability dashboard"
        description="Cross-functional view of environmental, social, and governance performance."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live
            </Badge>
          </div>
        }
      />

      {summary.isLoading ? (
        <LoadingBlock />
      ) : summary.isError ? (
        <ErrorBlock error={summary.error} onRetry={() => summary.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total CO₂"
            value={summary.data!.total_co2.toLocaleString()}
            unit="kg"
            delta="-8.2%"
            icon={Cloud}
            tone="env"
          />
          <KpiCard
            label="CSR participants"
            value={summary.data!.total_participants}
            delta="+12"
            icon={Users2}
            tone="social"
          />
          <KpiCard
            label="Open compliance"
            value={summary.data!.open_compliance_issues}
            delta="2 overdue"
            icon={ShieldAlert}
            tone="governance"
          />
          <KpiCard
            label="Top XP score"
            value={summary.data!.top_leaderboard[0]?.xp_points ?? 0}
            unit="XP"
            delta={summary.data!.top_leaderboard[0]?.name ?? "—"}
            icon={Trophy}
            tone="primary"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Emissions by department</CardTitle>
              <CardDescription>CO₂ totals across the current period</CardDescription>
            </div>
            <Badge variant="outline" className="text-env">Environmental</Badge>
          </CardHeader>
          <CardContent className="h-72">
            {emissions.data && emissions.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emissions.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="department" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
                  />
                  <Bar dataKey="total_co2" radius={[8, 8, 0, 0]}>
                    {emissions.data.map((_, i) => (
                      <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <LoadingBlock />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Leaderboard preview
            </CardTitle>
            <CardDescription>Top contributors this quarter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.data?.top_leaderboard.slice(0, 5).map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{p.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.xp_points} XP</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumulative carbon trend</CardTitle>
            <CardDescription>Rolling emissions from recorded transactions</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="date" stroke="currentColor" fontSize={12} />
                  <YAxis stroke="currentColor" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="co2" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <LoadingBlock />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI insights
            </CardTitle>
            <CardDescription>Signals from your ESG data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-medium">Electricity is your top emitter</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Consider a PPA renegotiation — projected 22% reduction.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-medium">{issues.data?.filter((i) => i.is_overdue).length ?? 0} overdue governance items</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Owners notified. Review the Governance module for details.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-medium">CSR momentum trending up</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Engineering leads with 3 approved participations this month.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}