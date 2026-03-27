import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAttendance } from '@/hooks/useAttendance';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, CheckCircle, XCircle, Clock, UserCheck, Users, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  half_day: 'bg-orange-100 text-orange-800',
};

export default function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();
  const { records, isLoading, upsertAttendance } = useAttendance(selectedDate);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', check_in: '', check_out: '', status: 'present', notes: '' });

  // Bulk marking state
  const [bulkStatus, setBulkStatus] = useState('present');
  const [bulkCheckIn, setBulkCheckIn] = useState('');
  const [bulkCheckOut, setBulkCheckOut] = useState('');
  const [bulkEntries, setBulkEntries] = useState<Record<string, string>>({});
  const [bulkSaving, setBulkSaving] = useState(false);

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

  // Initialize bulk entries when dialog opens
  const openBulkDialog = () => {
    const markedIds = new Set(records.map((r: any) => r.employee_id));
    const entries: Record<string, string> = {};
    employees.forEach((e: any) => {
      entries[e.id] = markedIds.has(e.id)
        ? (records.find((r: any) => r.employee_id === e.id)?.status || 'present')
        : bulkStatus;
    });
    setBulkEntries(entries);
    setBulkDialogOpen(true);
  };

  const handleBulkSubmit = async () => {
    setBulkSaving(true);
    let success = 0, failed = 0;
    for (const [empId, status] of Object.entries(bulkEntries)) {
      try {
        const { error } = await supabase
          .from('attendance')
          .upsert({
            employee_id: empId,
            attendance_date: selectedDate,
            status,
            check_in: bulkCheckIn || null,
            check_out: bulkCheckOut || null,
          } as any, { onConflict: 'employee_id,attendance_date' });
        if (error) throw error;
        success++;
      } catch {
        failed++;
      }
    }
    setBulkSaving(false);
    setBulkDialogOpen(false);
    toast.success(`${success}জন কর্মচারীর উপস্থিতি সেভ হয়েছে${failed > 0 ? `, ${failed}টি ব্যর্থ` : ''}`);
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };

  const setAllBulkStatus = (status: string) => {
    setBulkStatus(status);
    setBulkEntries(prev => {
      const updated: Record<string, string> = {};
      Object.keys(prev).forEach(id => { updated[id] = status; });
      return updated;
    });
  };

  const presentCount = records.filter((r: any) => r.status === 'present').length;
  const absentCount = records.filter((r: any) => r.status === 'absent').length;
  const lateCount = records.filter((r: any) => r.status === 'late').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />

          <Button variant="outline" onClick={openBulkDialog}>
            <Users className="h-4 w-4 mr-2" />Bulk Mark
          </Button>

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

      {/* Bulk Marking Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Attendance — {selectedDate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Global controls */}
            <div className="flex flex-wrap items-end gap-3 p-3 bg-muted rounded-lg">
              <div>
                <Label className="text-xs">সবার স্ট্যাটাস</Label>
                <Select value={bulkStatus} onValueChange={setAllBulkStatus}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Check In</Label>
                <Input type="time" value={bulkCheckIn} onChange={e => setBulkCheckIn(e.target.value)} className="w-[120px]" />
              </div>
              <div>
                <Label className="text-xs">Check Out</Label>
                <Input type="time" value={bulkCheckOut} onChange={e => setBulkCheckOut(e.target.value)} className="w-[120px]" />
              </div>
            </div>

            {/* Per-employee status */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কর্মচারী</TableHead>
                    <TableHead>পদবী</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="capitalize text-sm text-muted-foreground">{emp.role}</TableCell>
                      <TableCell>
                        <Select
                          value={bulkEntries[emp.id] || 'present'}
                          onValueChange={v => setBulkEntries(prev => ({ ...prev, [emp.id]: v }))}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="half_day">Half Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>বাতিল</Button>
              <Button onClick={handleBulkSubmit} disabled={bulkSaving}>
                {bulkSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                {employees.length}জন সেভ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
