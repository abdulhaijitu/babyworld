import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  User,
  Clock
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Booking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  ticket_type: 'child_guardian' | 'child_only' | 'group';
  booking_type: 'hourly_play' | 'birthday_event' | 'private_event';
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: string;
  notes: string | null;
  created_at: string;
}

interface BookingCalendarViewProps {
  bookings: Booking[];
  onBookingSelect?: (booking: Booking) => void;
}

export function BookingCalendarView({ bookings, onBookingSelect }: BookingCalendarViewProps) {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach(booking => {
      const dateKey = booking.slot_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleDayClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayBookings = bookingsByDate[dateKey];
    if (dayBookings && dayBookings.length > 0) {
      setSelectedDate(date);
      setDayDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const weekDays = language === 'bn' 
    ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedDayBookings = selectedDateKey ? bookingsByDate[selectedDateKey] || [] : [];

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {language === 'bn' ? 'বুকিং ক্যালেন্ডার' : 'Booking Calendar'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                {language === 'bn' ? 'আজ' : 'Today'}
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy', { locale: language === 'bn' ? bn : undefined })}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayBookings = bookingsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const confirmedCount = dayBookings.filter(b => b.status === 'confirmed').length;
              const pendingCount = dayBookings.filter(b => b.status === 'pending').length;

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-card' : 'bg-muted/30 text-muted-foreground'}
                    ${isToday ? 'border-primary border-2' : 'border-border'}
                    ${dayBookings.length > 0 ? 'hover:border-primary/50' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  {dayBookings.length > 0 && isCurrentMonth && (
                    <div className="space-y-1">
                      {confirmedCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs">{confirmedCount}</span>
                        </div>
                      )}
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="text-xs">{pendingCount}</span>
                        </div>
                      )}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayBookings.length - 2} {language === 'bn' ? 'আরও' : 'more'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              {language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              {language === 'bn' ? 'বাতিল' : 'Cancelled'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { 
                locale: language === 'bn' ? bn : undefined 
              })}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {selectedDayBookings.map((booking) => (
                <div 
                  key={booking.id}
                  onClick={() => {
                    onBookingSelect?.(booking);
                    setDayDialogOpen(false);
                  }}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{booking.parent_name}</span>
                    </div>
                    <Badge 
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                      className={booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : ''}
                    >
                      {booking.status === 'confirmed' 
                        ? (language === 'bn' ? 'নিশ্চিত' : 'Confirmed') 
                        : (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.time_slot}
                    </div>
                    <span>{booking.parent_phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
