import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Award, HeartHandshake, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — EcoSphere AI" }] }),
  component: NotificationsPage,
});

const items = [
  { icon: ShieldAlert, tone: "text-governance", title: "Compliance overdue", body: "‘Missing ISO 14001 evidence’ is 2 days overdue.", ago: "3h ago" },
  { icon: HeartHandshake, tone: "text-social", title: "CSR joined", body: "Marco Silva joined Beach Cleanup — awaiting approval.", ago: "6h ago" },
  { icon: Award, tone: "text-primary", title: "Badge unlocked", body: "Priya Shah unlocked the Impact Maker badge.", ago: "1d ago" },
  { icon: AlertTriangle, tone: "text-env", title: "Emissions spike", body: "Operations electricity usage +18% vs last week.", ago: "2d ago" },
];

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inbox" title="Notifications" description="ESG signals and workflow updates for your team." />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {items.map((n, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <div className={`grid h-9 w-9 place-items-center rounded-lg bg-muted ${n.tone}`}>
                <n.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.ago}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
              <Badge variant="outline">New</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}