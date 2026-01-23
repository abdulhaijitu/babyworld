import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  CalendarDays, 
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, parseISO, isSameDay } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Employee {
  id: string;
  name: string;
  role: 'staff' | 'supervisor' | 'manager';
  status: 'active' | 'inactive';
}

interface RosterShift {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  employee?: Employee;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export default function AdminRoster() {
  const { language } = useLanguage();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 6 })); // Saturday
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<RosterShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<RosterShift | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    start_time: '10:00',
    end_time: '18:00',
    notes: ''
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 6 });
      
      const [employeesRes, shiftsRes] = await Promise.all([
        supabase.from('employees').select('*').eq('status', 'active').order('name'),
        supabase.from('roster_shifts').select('*')
          .gte('shift_date', format(currentWeekStart, 'yyyy-MM-dd'))
          .lte('shift_date', format(weekEnd, 'yyyy-MM-dd'))
      ]);

      if (employeesRes.error) throw employeesRes.error;
      if (shiftsRes.error) throw shiftsRes.error;

      setEmployees((employeesRes.data || []) as Employee[]);
      setShifts((shiftsRes.data || []) as RosterShift[]);
    } catch (err: any) {
      console.error('[Roster] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveShift = async () => {
    if (!formData.employee_id || !selectedDate) {
      toast.error(language === 'bn' ? 'কর্মী সিলেক্ট করুন' : 'Select an employee');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast.error(language === 'bn' ? 'সময় সঠিক নয়' : 'Invalid time range');
      return;
    }

    setSaving(true);
    try {
      const shiftData = {
        employee_id: formData.employee_id,
        shift_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes || null
      };

      if (selectedShift) {
        const { error: updateError } = await supabase
          .from('roster_shifts')
          .update(shiftData)
          .eq('id', selectedShift.id);

        if (updateError) throw updateError;
        toast.success(language === 'bn' ? 'শিফট আপডেট হয়েছে' : 'Shift updated');
      } else {
        const { error: insertError } = await supabase
          .from('roster_shifts')
          .insert([shiftData]);

        if (insertError) throw insertError;
        toast.success(language === 'bn' ? 'শিফট যোগ হয়েছে' : 'Shift added');
      }

      closeDialog();
      fetchData();
    } catch (err: any) {
      console.error('[Roster] Save error:', err);
      if (err.message?.includes('unique')) {
        toast.error(language === 'bn' ? 'এই কর্মী ইতিমধ্যে এই সময়ে আছেন' : 'Employee already has a shift at this time');
      } else {
        toast.error(language === 'bn' ? 'সেভ ব্যর্থ' : 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('roster_shifts')
        .delete()
        .eq('id', shiftId);

      if (deleteError) throw deleteError;
      toast.success(language === 'bn' ? 'শিফট মুছে ফেলা হয়েছে' : 'Shift deleted');
      setShifts(prev => prev.filter(s => s.id !== shiftId));
    } catch (err) {
      toast.error(language === 'bn' ? 'মুছতে ব্যর্থ' : 'Delete failed');
    }
  };

  const openAddDialog = (date: Date) => {
    setSelectedDate(date);
    setSelectedShift(null);
    setFormData({ employee_id: '', start_time: '10:00', end_time: '18:00', notes: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (shift: RosterShift) => {
    setSelectedDate(parseISO(shift.shift_date));
    setSelectedShift(shift);
    setFormData({
      employee_id: shift.employee_id,
      start_time: shift.start_time.slice(0, 5),
      end_time: shift.end_time.slice(0, 5),
      notes: shift.notes || ''
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedDate(null);
    setSelectedShift(null);
    setFormData({ employee_id: '', start_time: '10:00', end_time: '18:00', notes: '' });
  };

  const getShiftsForDate = (date: Date) => {
    return shifts.filter(s => isSameDay(parseISO(s.shift_date), date));
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown';
  };

  const getRoleBadgeClass = (employeeId: string) => {
    const role = employees.find(e => e.id === employeeId)?.role;
    switch (role) {
      case 'manager': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'supervisor': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 6 }));
  };

  const totalShifts = shifts.length;
  const uniqueEmployees = new Set(shifts.map(s => s.employee_id)).size;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            {language === 'bn' ? 'রোস্টার' : 'Roster'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'সাপ্তাহিক শিফট ক্যালেন্ডার' : 'Weekly shift calendar'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'এই সপ্তাহে শিফট' : 'Shifts This Week'}</CardDescription>
            <CardTitle className="text-2xl">{totalShifts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'কর্মী' : 'Employees'}</CardDescription>
            <CardTitle className="text-2xl">{uniqueEmployees}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hidden sm:block">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'সক্রিয় কর্মী' : 'Active Staff'}</CardDescription>
            <CardTitle className="text-2xl">{employees.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
                {language === 'bn' ? 'এই সপ্তাহ' : 'This Week'}
              </Button>
            </div>
            <CardTitle className="text-lg">
              {format(currentWeekStart, 'dd MMM', { locale: language === 'bn' ? bn : undefined })} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy', { locale: language === 'bn' ? bn : undefined })}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchData} className="mt-4" size="sm">
                {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayShifts = getShiftsForDate(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`border rounded-lg p-2 min-h-[140px] ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(day, 'EEE', { locale: language === 'bn' ? bn : undefined })}
                        </p>
                        <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => openAddDialog(day)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      {dayShifts.map((shift) => (
                        <div 
                          key={shift.id}
                          className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${getRoleBadgeClass(shift.employee_id)}`}
                          onClick={() => openEditDialog(shift)}
                        >
                          <div className="font-medium truncate">{getEmployeeName(shift.employee_id)}</div>
                          <div className="flex items-center gap-1 text-[10px] opacity-75">
                            <Clock className="w-2.5 h-2.5" />
                            {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                          </div>
                        </div>
                      ))}
                      {dayShifts.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {language === 'bn' ? 'কোনো শিফট নেই' : 'No shifts'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Shift Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedShift 
                ? (language === 'bn' ? 'শিফট সম্পাদনা' : 'Edit Shift')
                : (language === 'bn' ? 'নতুন শিফট' : 'New Shift')
              }
            </DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: language === 'bn' ? bn : undefined })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'কর্মী' : 'Employee'} *</Label>
              <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'bn' ? 'কর্মী সিলেক্ট করুন' : 'Select employee'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {emp.name}
                        <Badge variant="outline" className="text-[10px] ml-1">{emp.role}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'শুরু' : 'Start Time'}</Label>
                <Select value={formData.start_time} onValueChange={(v) => setFormData({...formData, start_time: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'শেষ' : 'End Time'}</Label>
                <Select value={formData.end_time} onValueChange={(v) => setFormData({...formData, end_time: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                placeholder={language === 'bn' ? 'ঐচ্ছিক...' : 'Optional...'}
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedShift && (
              <Button 
                variant="destructive" 
                onClick={() => { handleDeleteShift(selectedShift.id); closeDialog(); }}
                className="sm:mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'মুছুন' : 'Delete'}
              </Button>
            )}
            <Button variant="outline" onClick={closeDialog}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveShift} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'সেভ করুন' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
