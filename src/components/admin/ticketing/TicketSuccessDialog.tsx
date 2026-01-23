import { useRef } from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, X, Check, Clock, User, Phone, Calendar, Ticket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TicketSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    ticket_number: string;
    guardian_name: string;
    guardian_phone: string;
    slot_date: string;
    in_time: string;
    out_time: string;
    guardian_count: number;
    child_count: number;
    socks_count: number;
    total_price: number;
    payment_type: string;
    payment_status: string;
    price_breakdown?: {
      entry_price: number;
      socks_price: number;
      rides_price: number;
      subtotal: number;
      discount_amount: number;
      membership_applied: boolean;
      total: number;
    };
    rides?: Array<{ ride_id: string; quantity: number; total_price: number; unit_price: number }>;
  } | null;
  rideNames?: Record<string, string>;
}

export function TicketSuccessDialog({ open, onClose, ticket, rideNames = {} }: TicketSuccessDialogProps) {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  if (!ticket) return null;
  
  const hasRides = ticket.rides && ticket.rides.length > 0;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${ticket.ticket_number}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #e91e63; }
            .ticket-number { font-size: 18px; font-weight: bold; margin: 10px 0; }
            .qr-container { text-align: center; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
            .label { color: #666; }
            .value { font-weight: 500; }
            .separator { border-top: 1px dashed #ccc; margin: 15px 0; }
            .total { font-size: 20px; font-weight: bold; text-align: center; margin: 15px 0; }
            .time-box { background: #f5f5f5; padding: 10px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const inTime = new Date(ticket.in_time);
  const outTime = new Date(ticket.out_time);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            {language === 'bn' ? 'টিকেট তৈরি সফল!' : 'Ticket Created Successfully!'}
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          {/* Header */}
          <div className="header text-center">
            <p className="logo text-2xl font-bold text-primary">Baby World</p>
            <p className="text-sm text-muted-foreground">Indoor Playground</p>
          </div>

          {/* Ticket Number */}
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Ticket className="h-4 w-4 mr-2" />
              {ticket.ticket_number}
            </Badge>
          </div>

          {/* QR Code */}
          <div className="qr-container flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <QRCodeSVG 
                value={ticket.ticket_number} 
                size={150}
                level="H"
                includeMargin
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 text-sm">
            <div className="info-row flex justify-between">
              <span className="label text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {language === 'bn' ? 'অভিভাবক' : 'Guardian'}
              </span>
              <span className="value font-medium">{ticket.guardian_name}</span>
            </div>
            <div className="info-row flex justify-between">
              <span className="label text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {language === 'bn' ? 'ফোন' : 'Phone'}
              </span>
              <span className="value font-medium">{ticket.guardian_phone}</span>
            </div>
            <div className="info-row flex justify-between">
              <span className="label text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </span>
              <span className="value font-medium">{ticket.slot_date}</span>
            </div>
          </div>

          <Separator className="separator" />

          {/* Time Box */}
          <div className="time-box p-3 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground">{language === 'bn' ? 'প্রবেশ' : 'IN'}</p>
                <p className="text-lg font-bold">{format(inTime, 'hh:mm a')}</p>
              </div>
              <Clock className="h-6 w-6 text-muted-foreground mx-4" />
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground">{language === 'bn' ? 'বের' : 'OUT'}</p>
                <p className="text-lg font-bold">{format(outTime, 'hh:mm a')}</p>
              </div>
            </div>
          </div>

          {/* Entry Details */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'bn' ? 'অভিভাবক' : 'Guardians'}</span>
              <span>{ticket.guardian_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'bn' ? 'শিশু' : 'Children'}</span>
              <span>{ticket.child_count}</span>
            </div>
            {ticket.socks_count > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'bn' ? 'মোজা' : 'Socks'}</span>
                <span>{ticket.socks_count} {language === 'bn' ? 'জোড়া' : 'pairs'}</span>
              </div>
            )}
          </div>

          {/* Rides Section */}
          {hasRides && (
            <>
              <Separator className="separator" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-muted-foreground mb-2">
                  {language === 'bn' ? 'রাইড সমূহ' : 'Rides'}
                </p>
                {ticket.rides!.map((ride, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {rideNames[ride.ride_id] || `Ride ${index + 1}`} × {ride.quantity}
                    </span>
                    <span>৳{ride.total_price}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator className="separator" />

          {/* Price */}
          <div className="total text-center">
            <p className="text-sm text-muted-foreground mb-1">{language === 'bn' ? 'মোট মূল্য' : 'Total Amount'}</p>
            <p className="text-2xl font-bold text-primary">৳{ticket.total_price}</p>
            <Badge variant={ticket.payment_status === 'paid' ? 'default' : 'secondary'} className="mt-2">
              {ticket.payment_type === 'cash' ? (language === 'bn' ? 'নগদ' : 'Cash') : (language === 'bn' ? 'অনলাইন' : 'Online')}
              {' • '}
              {ticket.payment_status === 'paid' ? (language === 'bn' ? 'পরিশোধিত' : 'Paid') : (language === 'bn' ? 'বাকি' : 'Pending')}
            </Badge>
          </div>

          {/* Footer */}
          <div className="footer text-center text-xs text-muted-foreground pt-4 border-t">
            <p>{language === 'bn' ? 'ধন্যবাদ! আবার আসবেন।' : 'Thank you! Visit again.'}</p>
            <p className="mt-1">Baby World Indoor Playground</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'প্রিন্ট করুন' : 'Print'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
