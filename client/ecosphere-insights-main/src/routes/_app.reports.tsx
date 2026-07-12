import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2, Leaf, HeartHandshake, ShieldCheck, Download } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — EcoSphere AI" }] }),
  component: ReportsPage,
});

const reports = [
  { key: "env", title: "Environmental report", desc: "GHG protocol scopes, emissions by department and activity.", icon: Leaf, tone: "text-env bg-env/10 ring-env/25" },
  { key: "soc", title: "Social & CSR report", desc: "Participation, hours contributed, categories of impact.", icon: HeartHandshake, tone: "text-social bg-social/10 ring-social/25" },
  { key: "gov", title: "Governance report", desc: "Open, closed and overdue compliance items with owners.", icon: ShieldCheck, tone: "text-governance bg-governance/10 ring-governance/25" },
  { key: "sum", title: "Executive summary", desc: "One-page ESG performance overview for leadership.", icon: FileBarChart2, tone: "text-primary bg-primary/10 ring-primary/25" },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="ESG report center"
        description="Generate audit-ready reports across environmental, social and governance data."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ring-1 ${r.tone}`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline">Q3 2026</Badge>
              </div>
              <CardTitle className="mt-3">{r.title}</CardTitle>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              {["PDF", "Excel", "CSV"].map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={fmt === "PDF" ? "default" : "outline"}
                  onClick={() => toast.info(`${fmt} export queued — will connect to backend export endpoint.`)}
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  {fmt}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}