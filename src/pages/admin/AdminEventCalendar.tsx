import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Cake, Gift, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

interface EventBooking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  booking_type: 'birthday_event' | 'private_event';
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: string;
  notes: string | null;
}

export default function AdminEventCalendar() {
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('booking_type', ['birthday_event', 'private_event'])
        .gte('slot_date', start)
        .lte('slot_date', end)
        .neq('status', 'cancelled')
        .order('slot_date', { ascending: true });
      if (error) throw error;
      setEvents((data || []) as EventBooking[]);
    } catch (err) {
      console.error('[EventCalendar]', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const eventsOnDate = (date: Date) => events.filter(e => isSameDay(parseISO(e.slot_date), date));
  const selectedEvents = eventsOnDate(selectedDate);

  const eventDates = events.map(e => parseISO(e.slot_date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending': return 'text-yellow-600 border-yellow-500/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--primary))',
                  textUnderlineOffset: '4px',
                },
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'dd MMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No events on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map(event => (
                  <div key={event.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {event.booking_type === 'birthday_event' ? (
                          <Cake className="w-4 h-4 text-pink-500" />
                        ) : (
                          <Gift className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="font-medium text-sm">{event.parent_name}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>📞 {event.parent_phone}</p>
                      <p>🕐 {event.time_slot}</p>
                      <p>{event.booking_type === 'birthday_event' ? '🎂 Birthday Party' : '🎁 Private Event'}</p>
                    </div>
                    {event.notes && (
                      <p className="text-xs bg-muted p-2 rounded">{event.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
