import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePayroll } from '@/hooks/usePayroll';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign, CheckCircle } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminPayroll() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { payrolls, isLoading, upsertPayroll, markAsPaid } = usePayroll(month, year);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', basic_salary: '', deductions: '0', bonuses: '0', notes: '' });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('id, name, role').eq('status', 'active').order('name');
      return data || [];
    },
  });

  const handleSubmit = () => {
    if (!form.employee_id || !form.basic_salary) return;
    const basic = Number(form.basic_salary);
    const ded = Number(form.deductions);
    const bon = Number(form.bonuses);
    upsertPayroll.mutate({
      employee_id: form.employee_id,
      month, year,
      basic_salary: basic,
      deductions: ded,
      bonuses: bon,
      net_salary: basic - ded + bon,
      notes: form.notes || undefined,
    });
    setDialogOpen(false);
    setForm({ employee_id: '', basic_salary: '', deductions: '0', bonuses: '0', notes: '' });
  };

  const totalNet = payrolls.reduce((s: number, p: any) => s + Number(p.net_salary), 0);
  const paidCount = payrolls.filter((p: any) => p.status === 'paid').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Payroll</h1>
        <div className="flex items-center gap-3">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-[100px]" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Payroll</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Payroll Entry</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Basic Salary (৳)</Label><Input type="number" value={form.basic_salary} onChange={e => setForm(p => ({ ...p, basic_salary: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Deductions (৳)</Label><Input type="number" value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} /></div>
                  <div><Label>Bonuses (৳)</Label><Input type="number" value={form.bonuses} onChange={e => setForm(p => ({ ...p, bonuses: e.target.value }))} /></div>
                </div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                <Button onClick={handleSubmit} className="w-full" disabled={upsertPayroll.isPending}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-3"><DollarSign className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total Net Salary</p><p className="text-2xl font-bold">৳{totalNet.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Entries</p><p className="text-2xl font-bold">{payrolls.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Paid</p><p className="text-2xl font-bold text-green-600">{paidCount}/{payrolls.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Payroll — {months[month - 1]} {year}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Bonuses</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : payrolls.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payroll records</TableCell></TableRow>
              ) : payrolls.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.employees?.name}</TableCell>
                  <TableCell>৳{Number(p.basic_salary).toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">-৳{Number(p.deductions).toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">+৳{Number(p.bonuses).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">৳{Number(p.net_salary).toLocaleString()}</TableCell>
                  <TableCell><Badge className={p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{p.status}</Badge></TableCell>
                  <TableCell>
                    {p.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => markAsPaid.mutate(p.id)}><CheckCircle className="h-4 w-4 mr-1" />Pay</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
