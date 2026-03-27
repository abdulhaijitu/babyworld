import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAttendance } from '@/hooks/useAttendance';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  half_day: 'bg-orange-100 text-orange-800',
};

export default function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { records, isLoading, upsertAttendance } = useAttendance(selectedDate);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', check_in: '', check_out: '', status: 'present', notes: '' });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('id, name, role').eq('status', 'active').order('name');
      return data || [];
    },
  });

  const handleSubmit = () => {
    if (!form.employee_id) return;
    upsertAttendance.mutate({
      employee_id: form.employee_id,
      attendance_date: selectedDate,
      check_in: form.check_in || undefined,
      check_out: form.check_out || undefined,
      status: form.status,
      notes: form.notes || undefined,
    });
    setDialogOpen(false);
    setForm({ employee_id: '', check_in: '', check_out: '', status: 'present', notes: '' });
  };

  const presentCount = records.filter((r: any) => r.status === 'present').length;
  const absentCount = records.filter((r: any) => r.status === 'absent').length;
  const lateCount = records.filter((r: any) => r.status === 'late').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex items-center gap-3">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserCheck className="h-4 w-4 mr-2" />Mark Attendance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Check In</Label><Input type="time" value={form.check_in} onChange={e => setForm(p => ({ ...p, check_in: e.target.value }))} /></div>
                  <div><Label>Check Out</Label><Input type="time" value={form.check_out} onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))} /></div>
                </div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                <Button onClick={handleSubmit} className="w-full" disabled={upsertAttendance.isPending}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-3"><CalendarDays className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{records.length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-600" /><div><p className="text-sm text-muted-foreground">Present</p><p className="text-2xl font-bold">{presentCount}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><XCircle className="h-8 w-8 text-red-600" /><div><p className="text-sm text-muted-foreground">Absent</p><p className="text-2xl font-bold">{absentCount}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><Clock className="h-8 w-8 text-yellow-600" /><div><p className="text-sm text-muted-foreground">Late</p><p className="text-2xl font-bold">{lateCount}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Attendance Records — {selectedDate}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No records for this date</TableCell></TableRow>
              ) : records.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.employees?.name}</TableCell>
                  <TableCell><Badge className={statusColors[r.status] || ''}>{r.status}</Badge></TableCell>
                  <TableCell>{r.check_in || '—'}</TableCell>
                  <TableCell>{r.check_out || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{r.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
