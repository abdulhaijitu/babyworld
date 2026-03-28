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
import { Plus, DollarSign, CheckCircle, Printer, FileText } from 'lucide-react';
import { printPayslip, printBulkPayslips } from '@/lib/printPayslip';

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
    <div className="space-y-4">
      <div className="flex items-center justify-end flex-wrap gap-2">
        <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
          <SelectTrigger className="w-[110px] lg:w-[140px] h-8 lg:h-10 text-xs lg:text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-[80px] lg:w-[100px] h-8 lg:h-10 text-xs lg:text-sm" />
        {payrolls.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => printBulkPayslips(payrolls.map((p: any) => ({
            employeeName: p.employees?.name || '',
            employeeRole: p.employees?.role || '',
            month, year,
            basicSalary: p.basic_salary,
            deductions: p.deductions,
            bonuses: p.bonuses,
            netSalary: p.net_salary,
            status: p.status,
            paidAt: p.paid_at,
            notes: p.notes,
          })))}>
            <FileText className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Bulk Print</span>
          </Button>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">Add Payroll</span></Button>
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

      {/* Stats - always 3 cols compact */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold">৳{totalNet.toLocaleString()}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Total Net</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold">{payrolls.length}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold text-green-600">{paidCount}/{payrolls.length}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base lg:text-lg">Payroll — {months[month - 1]} {year}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 lg:p-6 lg:pt-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : payrolls.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No payroll records</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y">
                {payrolls.map((p: any) => (
                  <div key={p.id} className="p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{p.employees?.name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Basic: ৳{Number(p.basic_salary).toLocaleString()}</span>
                      <span className="text-red-600">-৳{Number(p.deductions).toLocaleString()}</span>
                      <span className="text-green-600">+৳{Number(p.bonuses).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">৳{Number(p.net_salary).toLocaleString()}</span>
                      <div className="flex gap-1">
                        {p.status === 'draft' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markAsPaid.mutate(p.id)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />Pay
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => printPayslip({
                          employeeName: p.employees?.name || '',
                          employeeRole: p.employees?.role || '',
                          month, year,
                          basicSalary: p.basic_salary,
                          deductions: p.deductions,
                          bonuses: p.bonuses,
                          netSalary: p.net_salary,
                          status: p.status,
                          paidAt: p.paid_at,
                          notes: p.notes,
                        })}>
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
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
                    {payrolls.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.employees?.name}</TableCell>
                        <TableCell>৳{Number(p.basic_salary).toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">-৳{Number(p.deductions).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">+৳{Number(p.bonuses).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">৳{Number(p.net_salary).toLocaleString()}</TableCell>
                        <TableCell><Badge className={p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{p.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {p.status === 'draft' && (
                              <Button size="sm" variant="outline" onClick={() => markAsPaid.mutate(p.id)}><CheckCircle className="h-4 w-4 mr-1" />Pay</Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => printPayslip({
                              employeeName: p.employees?.name || '',
                              employeeRole: p.employees?.role || '',
                              month, year,
                              basicSalary: p.basic_salary,
                              deductions: p.deductions,
                              bonuses: p.bonuses,
                              netSalary: p.net_salary,
                              status: p.status,
                              paidAt: p.paid_at,
                              notes: p.notes,
                            })}>
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
