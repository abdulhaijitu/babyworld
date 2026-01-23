import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  MapPin,
  Phone,
  Clock,
  Calendar,
  User,
  Ticket as TicketIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import babyWorldLogo from '@/assets/baby-world-logo.png';

interface BookingData {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  ticket_type: string;
  booking_type: string;
  status: string;
  payment_status: string;
}

interface BookingPrintTicketProps {
  booking: BookingData;
  onClose?: () => void;
}

export function BookingPrintTicket({ booking, onClose }: BookingPrintTicketProps) {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  // Generate a booking reference number
  const bookingRef = `BK${booking.id.slice(0, 8).toUpperCase()}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking - ${bookingRef}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
          .ticket { 
            border: 2px dashed #ccc; 
            border-radius: 12px;
            padding: 24px;
            background: #fff;
          }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { height: 50px; margin-bottom: 8px; }
          .header h1 { font-size: 18px; color: #333; }
          .header p { font-size: 12px; color: #666; }
          .qr-section { text-align: center; margin: 20px 0; }
          .qr-section svg { width: 120px; height: 120px; }
          .ticket-number { 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold;
            color: #7c3aed;
            margin: 16px 0;
            letter-spacing: 2px;
          }
          .divider { 
            border-top: 1px dashed #ccc; 
            margin: 16px 0; 
          }
          .info-row { 
            display: flex; 
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .info-label { color: #666; }
          .info-value { font-weight: 500; color: #333; }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-confirmed { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef9c3; color: #854d0e; }
          .status-paid { background: #dbeafe; color: #1e40af; }
          .footer { 
            text-align: center; 
            margin-top: 20px;
            font-size: 11px;
            color: #999;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const qrData = JSON.stringify({
    id: booking.id,
    ref: bookingRef,
    date: booking.slot_date,
    slot: booking.time_slot,
    type: booking.ticket_type
  });

  const getTicketTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      child_guardian: { en: 'Child + Guardian', bn: 'শিশু + অভিভাবক' },
      child_only: { en: 'Child Only', bn: 'শুধু শিশু' },
      group: { en: 'Group', bn: 'গ্রুপ' }
    };
    return labels[type]?.[language === 'bn' ? 'bn' : 'en'] || type;
  };

  const getBookingTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      hourly_play: { en: 'Hourly Play', bn: 'আওয়ারলি প্লে' },
      birthday_event: { en: 'Birthday Event', bn: 'বার্থডে ইভেন্ট' },
      private_event: { en: 'Private Event', bn: 'প্রাইভেট ইভেন্ট' }
    };
    return labels[type]?.[language === 'bn' ? 'bn' : 'en'] || type;
  };

  return (
    <div className="space-y-4">
      {/* Print Preview */}
      <div ref={printRef}>
        <div className="ticket border-2 border-dashed border-border rounded-xl p-6 bg-card max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <img src={babyWorldLogo} alt="Baby World" className="h-12 mx-auto mb-2" />
            <h1 className="text-lg font-bold">Baby World Indoor Playground</h1>
            <p className="text-xs text-muted-foreground">
              {language === 'bn' ? 'বুকিং কনফার্মেশন' : 'Booking Confirmation'}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center my-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <QRCodeSVG 
                value={qrData} 
                size={100}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Booking Ref */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {language === 'bn' ? 'বুকিং রেফারেন্স' : 'Booking Reference'}
            </p>
            <p className="text-2xl font-bold text-primary tracking-widest">
              {bookingRef}
            </p>
          </div>

          <Separator className="my-4" style={{ borderStyle: 'dashed' }} />

          {/* Booking Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                {language === 'bn' ? 'অভিভাবক' : 'Parent'}
              </span>
              <span className="font-medium">{booking.parent_name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {language === 'bn' ? 'ফোন' : 'Phone'}
              </span>
              <span className="font-medium">{booking.parent_phone}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </span>
              <span className="font-medium">
                {format(parseISO(booking.slot_date), 'dd MMM yyyy', { 
                  locale: language === 'bn' ? bn : undefined 
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {language === 'bn' ? 'সময়' : 'Time'}
              </span>
              <span className="font-medium">{booking.time_slot}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <TicketIcon className="w-4 h-4" />
                {language === 'bn' ? 'টাইপ' : 'Type'}
              </span>
              <span className="font-medium">{getTicketTypeLabel(booking.ticket_type)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {language === 'bn' ? 'বুকিং টাইপ' : 'Booking Type'}
              </span>
              <span className="font-medium">{getBookingTypeLabel(booking.booking_type)}</span>
            </div>
          </div>

          <Separator className="my-4" style={{ borderStyle: 'dashed' }} />

          {/* Status */}
          <div className="flex justify-center gap-2">
            <span className={`status-badge ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'} px-3 py-1 rounded-full text-xs`}>
              {booking.status === 'confirmed' ? (language === 'bn' ? 'নিশ্চিত' : 'Confirmed') : (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${booking.payment_status === 'paid' ? 'bg-blue-500/10 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
              {booking.payment_status === 'paid' ? (language === 'bn' ? 'পেইড' : 'Paid') : (language === 'bn' ? 'আনপেইড' : 'Unpaid')}
            </span>
          </div>

          <Separator className="my-4" style={{ borderStyle: 'dashed' }} />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p className="flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Dhaka, Bangladesh
            </p>
            <p className="flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" />
              +880 1234-567890
            </p>
            <p className="mt-2 italic">
              {language === 'bn' 
                ? 'এই টিকেটটি প্রবেশের সময় দেখান' 
                : 'Please show this ticket at entry'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center no-print">
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'প্রিন্ট করুন' : 'Print'}
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
        )}
      </div>
    </div>
  );
}
