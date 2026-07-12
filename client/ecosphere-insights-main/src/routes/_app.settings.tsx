import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — EcoSphere AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const toggle = useUIStore((s) => s.toggleTheme);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Workspace" title="Settings" description="Manage organization preferences and integrations." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Organization</CardTitle><CardDescription>Public details on reports and exports.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Company name</Label><Input defaultValue="Acme Corp" /></div>
            <div className="space-y-1.5"><Label>Reporting period</Label><Input defaultValue="Q3 2026" /></div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Personal workspace settings.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark mode</Label>
                <p className="text-xs text-muted-foreground">Optimized for long analysis sessions.</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggle} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}