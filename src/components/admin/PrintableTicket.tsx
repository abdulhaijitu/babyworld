import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  Download,
  MapPin,
  Phone,
  Clock,
  Calendar,
  User,
  Baby,
  Ticket as TicketIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import babyWorldLogo from '@/assets/baby-world-logo.png';

interface TicketData {
  ticketNumber: string;
  guardianName: string;
  guardianPhone: string;
  childName?: string;
  slotDate: string;
  timeSlot: string;
  ticketType: string;
  source: string;
  createdAt: string;
  // Price fields
  entryPrice?: number;
  socksPrice?: number;
  addonsPrice?: number;
  discountApplied?: number;
  totalPrice?: number;
  guardianCount?: number;
  childCount?: number;
  socksCount?: number;
}

interface PrintableTicketProps {
  ticket: TicketData;
  onClose?: () => void;
}

export function PrintableTicket({ ticket, onClose }: PrintableTicketProps) {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket - ${ticket.ticketNumber}</title>
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
    id: ticket.ticketNumber,
    date: ticket.slotDate,
    slot: ticket.timeSlot,
    type: ticket.ticketType
  });

  const getTicketTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      hourly_play: { en: 'Hourly Play (1 Hour)', bn: 'আওয়ারলি প্লে (১ ঘন্টা)' },
      extended: { en: 'Extended Play (2 Hours)', bn: 'এক্সটেন্ডেড (২ ঘন্টা)' },
      child_guardian: { en: 'Child + Guardian', bn: 'শিশু + অভিভাবক' },
      child_only: { en: 'Child Only', bn: 'শুধু শিশু' }
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
              {language === 'bn' ? 'বেবি ওয়ার্ল্ড ইনডোর প্লেগ্রাউন্ড' : 'Safe Fun for Kids!'}
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

          {/* Ticket Number */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {language === 'bn' ? 'টিকেট নম্বর' : 'Ticket Number'}
            </p>
            <p className="text-2xl font-bold text-primary tracking-widest">
              {ticket.ticketNumber}
            </p>
          </div>

          <Separator className="my-4" style={{ borderStyle: 'dashed' }} />

          {/* Ticket Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                {language === 'bn' ? 'অভিভাবক' : 'Guardian'}
              </span>
              <span className="font-medium">{ticket.guardianName}</span>
            </div>

            {ticket.childName && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Baby className="w-4 h-4" />
                  {language === 'bn' ? 'শিশু' : 'Child'}
                </span>
                <span className="font-medium">{ticket.childName}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {language === 'bn' ? 'ফোন' : 'Phone'}
              </span>
              <span className="font-medium">{ticket.guardianPhone}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </span>
              <span className="font-medium">
                {format(parseISO(ticket.slotDate), 'dd MMM yyyy', { 
                  locale: language === 'bn' ? bn : undefined 
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {language === 'bn' ? 'সময়' : 'Time'}
              </span>
              <span className="font-medium">{ticket.timeSlot}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <TicketIcon className="w-4 h-4" />
                {language === 'bn' ? 'টাইপ' : 'Type'}
              </span>
              <span className="font-medium">{getTicketTypeLabel(ticket.ticketType)}</span>
            </div>
          </div>

          {/* Price Breakdown - only show if we have price info */}
          {ticket.totalPrice !== undefined && ticket.totalPrice > 0 && (
            <>
              <Separator className="my-4" style={{ borderStyle: 'dashed' }} />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-center mb-2">
                  {language === 'bn' ? 'মূল্য বিবরণ' : 'Price Details'}
                </p>
                
                {ticket.guardianCount && ticket.childCount && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{language === 'bn' ? 'অভিভাবক + শিশু' : 'Guardian + Child'}</span>
                    <span>{ticket.guardianCount} + {ticket.childCount}</span>
                  </div>
                )}
                
                {ticket.entryPrice !== undefined && ticket.entryPrice > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'bn' ? 'এন্ট্রি' : 'Entry'}</span>
                    <span>৳{ticket.entryPrice}</span>
                  </div>
                )}
                
                {ticket.socksCount !== undefined && ticket.socksCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'bn' ? 'মোজা' : 'Socks'} ({ticket.socksCount})</span>
                    <span>৳{ticket.socksPrice || 0}</span>
                  </div>
                )}
                
                {ticket.addonsPrice !== undefined && ticket.addonsPrice > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'bn' ? 'রাইড' : 'Rides'}</span>
                    <span>৳{ticket.addonsPrice}</span>
                  </div>
                )}
                
                {ticket.discountApplied !== undefined && ticket.discountApplied > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>{language === 'bn' ? 'মেম্বারশিপ ছাড়' : 'Member Discount'}</span>
                    <span>-৳{ticket.discountApplied}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                  <span className="text-primary">৳{ticket.totalPrice}</span>
                </div>
              </div>
            </>
          )}

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
