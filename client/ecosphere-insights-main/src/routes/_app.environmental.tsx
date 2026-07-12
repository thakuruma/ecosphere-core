import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Cloud, Download, Leaf, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBlock, SkeletonGrid } from "@/components/shared/StateViews";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCarbonTransactions,
  useCreateCarbonTransaction,
  useCreateEmissionFactor,
  useDepartments,
  useEmissionFactors,
  useEmissionsSummary,
} from "@/hooks/queries";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/environmental")({
  head: () => ({ meta: [{ title: "Environmental — EcoSphere AI" }] }),
  component: EnvironmentalPage,
});

const txSchema = z.object({
  department_id: z.coerce.number().int().positive(),
  emission_factor_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive("Quantity must be > 0"),
  transaction_date: z
    .string()
    .refine((v) => v <= new Date().toISOString().slice(0, 10), "Date cannot be in the future"),
});
const factorSchema = z.object({
  activity_name: z.string().trim().min(2),
  unit: z.string().trim().min(1),
  co2_per_unit: z.coerce.number().positive(),
});

function EnvironmentalPage() {
  const [txOpen, setTxOpen] = useState(false);
  const [fOpen, setFOpen] = useState(false);
  const { data: departments } = useDepartments();
  const { data: factors } = useEmissionFactors();
  const summary = useEmissionsSummary();
  const tx = useCarbonTransactions();
  const createTx = useCreateCarbonTransaction();
  const createF = useCreateEmissionFactor();

  const txForm = useForm({
    resolver: zodResolver(txSchema),
    defaultValues: {
      department_id: 1,
      emission_factor_id: 1,
      quantity: 0,
      transaction_date: new Date().toISOString().slice(0, 10),
    },
  });
  const fForm = useForm({
    resolver: zodResolver(factorSchema),
    defaultValues: { activity_name: "", unit: "", co2_per_unit: 0 },
  });

  const total = (tx.data ?? []).reduce((s, t) => s + t.co2_emitted, 0);
  const byActivity = (tx.data ?? []).reduce<Record<string, number>>((acc, t) => {
    const k = t.activity_name ?? "Other";
    acc[k] = (acc[k] ?? 0) + t.co2_emitted;
    return acc;
  }, {});
  const activityData = Object.entries(byActivity).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  const exportCsv = () => {
    const rows = ["date,department,activity,quantity,co2_emitted"];
    (tx.data ?? []).forEach((t) => {
      rows.push(`${t.transaction_date},${t.department},${t.activity_name},${t.quantity},${t.co2_emitted}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carbon-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Environmental"
        title="Carbon operations"
        description="Log emissions activity, manage factors, and analyze department performance."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export</Button>
            <Dialog open={txOpen} onOpenChange={setTxOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Log emission</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Log carbon transaction</DialogTitle></DialogHeader>
                <form
                  className="space-y-3"
                  onSubmit={txForm.handleSubmit(async (v) => {
                    try {
                      await createTx.mutateAsync(v);
                      toast.success("Emission logged");
                      setTxOpen(false);
                      txForm.reset();
                    } catch (e) {
                      toast.error(apiErrorMessage(e));
                    }
                  })}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Department</Label>
                      <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" {...txForm.register("department_id")}>
                        {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Emission factor</Label>
                      <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" {...txForm.register("emission_factor_id")}>
                        {factors?.map((f) => <option key={f.id} value={f.id}>{f.activity_name} ({f.unit})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Quantity</Label>
                      <Input type="number" step="0.01" {...txForm.register("quantity")} />
                      {txForm.formState.errors.quantity && <p className="text-xs text-destructive">{txForm.formState.errors.quantity.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input type="date" {...txForm.register("transaction_date")} />
                      {txForm.formState.errors.transaction_date && <p className="text-xs text-destructive">{txForm.formState.errors.transaction_date.message}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createTx.isPending}>Log emission</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total CO₂" value={total.toFixed(1)} unit="kg" icon={Cloud} tone="env" />
        <KpiCard label="Transactions" value={tx.data?.length ?? 0} icon={Leaf} tone="env" />
        <KpiCard label="Departments reporting" value={summary.data?.length ?? 0} icon={Leaf} tone="primary" />
        <KpiCard label="Emission factors" value={factors?.length ?? 0} icon={Leaf} tone="primary" />
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="factors">Emission factors</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>By department</CardTitle>
              <CardDescription>Total CO₂ output</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {summary.data && summary.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                    <XAxis dataKey="department" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Bar dataKey="total_co2" radius={[8, 8, 0, 0]}>
                      {summary.data.map((_, i) => <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <SkeletonGrid />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>By activity</CardTitle>
              <CardDescription>Emissions mix</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={activityData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                      {activityData.map((_, i) => <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <SkeletonGrid />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {tx.isLoading ? <SkeletonGrid rows={5} /> : tx.isError ? <ErrorBlock error={tx.error} onRetry={() => tx.refetch()} /> :
                (tx.data ?? []).length === 0 ? <EmptyState title="No transactions" description="Log your first emission to see it here." /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">CO₂ (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tx.data!.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.transaction_date}</TableCell>
                        <TableCell>{t.department}</TableCell>
                        <TableCell><Badge variant="outline">{t.activity_name}</Badge></TableCell>
                        <TableCell className="text-right">{t.quantity}</TableCell>
                        <TableCell className="text-right font-medium">{t.co2_emitted.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Emission factors</CardTitle>
              <Dialog open={fOpen} onOpenChange={setFOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />New factor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create emission factor</DialogTitle></DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={fForm.handleSubmit(async (v) => {
                      try {
                        await createF.mutateAsync(v);
                        toast.success("Factor added");
                        setFOpen(false);
                        fForm.reset();
                      } catch (e) {
                        toast.error(apiErrorMessage(e));
                      }
                    })}
                  >
                    <div className="space-y-1.5"><Label>Activity name</Label><Input {...fForm.register("activity_name")} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Unit</Label><Input {...fForm.register("unit")} placeholder="kWh, m3, L…" /></div>
                      <div className="space-y-1.5"><Label>CO₂ / unit</Label><Input type="number" step="0.001" {...fForm.register("co2_per_unit")} /></div>
                    </div>
                    <DialogFooter><Button type="submit" disabled={createF.isPending}>Add factor</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {factors && factors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">CO₂ per unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factors.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.activity_name}</TableCell>
                        <TableCell>{f.unit}</TableCell>
                        <TableCell className="text-right">{f.co2_per_unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <SkeletonGrid />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}