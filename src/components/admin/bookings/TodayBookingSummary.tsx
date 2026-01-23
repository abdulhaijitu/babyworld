import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Booking {
  id: string;
  slot_date: string;
  time_slot: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: string;
}

interface TodayBookingSummaryProps {
  bookings: Booking[];
}

export function TodayBookingSummary({ bookings }: TodayBookingSummaryProps) {
  const { language } = useLanguage();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // Filter today's bookings
  const todayBookings = bookings.filter(b => b.slot_date === todayStr);
  
  // Calculate stats
  const confirmed = todayBookings.filter(b => b.status === 'confirmed').length;
  const pending = todayBookings.filter(b => b.status === 'pending').length;
  const cancelled = todayBookings.filter(b => b.status === 'cancelled').length;
  const paid = todayBookings.filter(b => b.payment_status === 'paid').length;
  
  // Group by time slot
  const byTimeSlot: Record<string, number> = {};
  todayBookings.forEach(b => {
    if (b.status !== 'cancelled') {
      byTimeSlot[b.time_slot] = (byTimeSlot[b.time_slot] || 0) + 1;
    }
  });
  
  const sortedSlots = Object.entries(byTimeSlot).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          {language === 'bn' ? 'আজকের বুকিং সামারি' : "Today's Booking Summary"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: language === 'bn' ? bn : undefined })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status breakdown */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-card rounded-lg border">
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              {language === 'bn' ? 'মোট' : 'Total'}
            </div>
          </div>
          <div className="text-center p-3 bg-card rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{confirmed}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              {language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}
            </div>
          </div>
          <div className="text-center p-3 bg-card rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-600">{pending}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-yellow-600" />
              {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
            </div>
          </div>
          <div className="text-center p-3 bg-card rounded-lg border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-600">{paid}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              {language === 'bn' ? 'পেইড' : 'Paid'}
            </div>
          </div>
        </div>
        
        {/* Time slot breakdown */}
        {sortedSlots.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {language === 'bn' ? 'টাইম স্লট অনুযায়ী' : 'By Time Slot'}
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedSlots.map(([slot, count]) => (
                <Badge key={slot} variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {slot}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {todayBookings.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{language === 'bn' ? 'আজকে কোনো বুকিং নেই' : 'No bookings for today'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
