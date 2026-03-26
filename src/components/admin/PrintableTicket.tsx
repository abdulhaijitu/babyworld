import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, User, Baby, Phone, Clock, Calendar, Ticket as TicketIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
  entryPrice?: number;
  socksPrice?: number;
  addonsPrice?: number;
  discountApplied?: number;
  totalPrice?: number;
  guardianCount?: number;
  childCount?: number;
  socksCount?: number;
  inTime?: string;
  outTime?: string;
  paymentType?: string;
  paymentStatus?: string;
  rides?: Array<{ name: string; quantity: number; total_price: number }>;
}

interface PrintableTicketProps {
  ticket: TicketData;
  onClose?: () => void;
}

function generatePrintHTML(ticket: TicketData, qrSvgString: string, logoUrl: string): string {
  const dateFormatted = (() => {
    try { return format(parseISO(ticket.slotDate), 'dd MMM yyyy'); } catch { return ticket.slotDate; }
  })();

  const hasPricing = ticket.totalPrice !== undefined && ticket.totalPrice > 0;

  const priceBreakdownHTML = hasPricing ? `
    <div class="sep"></div>
    <div class="breakdown">
      <div style="text-align:center;font-weight:600;font-size:13px;margin-bottom:8px">💰 Price Details</div>
      ${ticket.guardianCount && ticket.childCount ? `<div class="info-row"><span class="label">Guardian + Child</span><span class="value">${ticket.guardianCount} + ${ticket.childCount}</span></div>` : ''}
      ${ticket.entryPrice && ticket.entryPrice > 0 ? `<div class="info-row"><span class="label">Entry</span><span class="value">৳${ticket.entryPrice}</span></div>` : ''}
      ${ticket.socksCount && ticket.socksCount > 0 ? `<div class="info-row"><span class="label">Socks (${ticket.socksCount})</span><span class="value">৳${ticket.socksPrice || 0}</span></div>` : ''}
      ${ticket.addonsPrice && ticket.addonsPrice > 0 ? `<div class="info-row"><span class="label">Rides</span><span class="value">৳${ticket.addonsPrice}</span></div>` : ''}
      ${ticket.discountApplied && ticket.discountApplied > 0 ? `<div class="info-row discount"><span class="label">Discount</span><span class="value">-৳${ticket.discountApplied}</span></div>` : ''}
      <div class="total-divider"></div>
    </div>
    <div class="total-box">
      <div class="total-label">Total</div>
      <div class="total-amount">৳${ticket.totalPrice}</div>
    </div>
  ` : '';

  const typeLabel: Record<string, string> = {
    hourly_play: 'Hourly Play (1 Hour)',
    extended: 'Extended Play (2 Hours)',
    child_guardian: 'Child + Guardian',
    child_only: 'Child Only',
  };

  return `<!DOCTYPE html>
<html><head><title>Ticket - ${ticket.ticketNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI','Hind Siliguri',Arial,sans-serif;padding:20px;max-width:380px;margin:0 auto;background:#fff;color:#333}
.ticket{border:2px dashed #e91e63;border-radius:16px;padding:24px 20px}
.header{text-align:center;padding-bottom:14px;border-bottom:1px dashed #ddd;margin-bottom:14px}
.header img{height:48px;margin:0 auto 6px;display:block}
.header h2{font-size:15px;color:#333;font-weight:700}
.header p{font-size:11px;color:#888}
.ticket-num-wrap{text-align:center;margin:12px 0}
.ticket-num{font-size:18px;font-weight:bold;letter-spacing:2px;color:#e91e63;background:#fce4ec;padding:8px 16px;border-radius:20px;display:inline-block}
.qr-wrap{text-align:center;margin:16px 0;padding:14px;background:#fafafa;border-radius:12px}
.qr-wrap svg{width:140px!important;height:140px!important}
.qr-wrap p{font-size:10px;color:#999;margin-top:6px}
.info-row{display:flex;justify-content:space-between;margin:5px 0;font-size:13px}
.label{color:#666}
.value{font-weight:600}
.sep{border-top:1px dashed #ddd;margin:12px 0}
.breakdown .discount{color:#4caf50}
.total-divider{border-top:2px solid #e91e63;margin:8px 0}
.total-box{text-align:center;padding:14px;background:linear-gradient(135deg,#e91e63,#c2185b);border-radius:12px;color:#fff;margin:10px 0}
.total-label{font-size:11px;opacity:.85}
.total-amount{font-size:28px;font-weight:bold}
.footer{text-align:center;font-size:11px;color:#888;margin-top:14px;padding-top:12px;border-top:1px dashed #ddd}
@media print{body{padding:0}.ticket{border:2px dashed #e91e63!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body><div class="ticket">
  <div class="header">
    <img src="${logoUrl}" alt="Baby World"/>
    <h2>Baby World Indoor Playground</h2>
    <p>Safe Fun for Kids!</p>
  </div>
  <div class="ticket-num-wrap"><span class="ticket-num">🎫 ${ticket.ticketNumber}</span></div>
  <div class="qr-wrap">${qrSvgString}<p>Scan at gate</p></div>
  <div class="info-row"><span class="label">👤 Guardian</span><span class="value">${ticket.guardianName}</span></div>
  ${ticket.childName ? `<div class="info-row"><span class="label">👶 Child</span><span class="value">${ticket.childName}</span></div>` : ''}
  <div class="info-row"><span class="label">📞 Phone</span><span class="value">${ticket.guardianPhone}</span></div>
  <div class="sep"></div>
  <div class="info-row"><span class="label">📅 Date</span><span class="value">${dateFormatted}</span></div>
  <div class="info-row"><span class="label">⏰ Time</span><span class="value">${ticket.timeSlot}</span></div>
  <div class="info-row"><span class="label">🎟️ Type</span><span class="value">${typeLabel[ticket.ticketType] || ticket.ticketType}</span></div>
  ${priceBreakdownHTML}
  <div class="footer">
    <p>📍 Dhaka, Bangladesh</p>
    <p>📞 +880 1234-567890</p>
    <p style="margin-top:6px;font-style:italic">Please show this ticket at entry</p>
  </div>
</div></body></html>`;
}

export function PrintableTicket({ ticket, onClose }: PrintableTicketProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    id: ticket.ticketNumber,
    date: ticket.slotDate,
    slot: ticket.timeSlot,
    type: ticket.ticketType
  });

  const handlePrint = () => {
    if (!qrRef.current) return;
    const qrSvg = qrRef.current.querySelector('svg');
    const qrSvgString = qrSvg ? qrSvg.outerHTML : '';
    const logoUrl = new URL(babyWorldLogo, window.location.origin).href;

    const html = generatePrintHTML(ticket, qrSvgString, logoUrl);
    const printWindow = window.open('', '', 'width=450,height=800');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const getTicketTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hourly_play: 'Hourly Play (1 Hour)',
      extended: 'Extended Play (2 Hours)',
      child_guardian: 'Child + Guardian',
      child_only: 'Child Only',
    };
    return labels[type] || type;
  };

  const dateFormatted = (() => {
    try { return format(parseISO(ticket.slotDate), 'dd MMM yyyy'); } catch { return ticket.slotDate; }
  })();

  const hasPricing = ticket.totalPrice !== undefined && ticket.totalPrice > 0;

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-pink-300 rounded-xl p-5 bg-card max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <img src={babyWorldLogo} alt="Baby World" className="h-10 mx-auto mb-1" />
          <h1 className="text-base font-bold">Baby World Indoor Playground</h1>
          <p className="text-[11px] text-muted-foreground">Safe Fun for Kids!</p>
        </div>

        {/* Ticket Number */}
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-base px-4 py-1.5 bg-pink-50 text-pink-700 border-pink-200">
            <TicketIcon className="h-4 w-4 mr-2" />
            {ticket.ticketNumber}
          </Badge>
        </div>

        {/* QR Code */}
        <div ref={qrRef} className="flex justify-center mb-3">
          <div className="p-3 bg-white rounded-lg shadow-sm border">
            <QRCodeSVG value={qrData} size={100} level="M" includeMargin={false} />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground"><User className="w-3.5 h-3.5" /> Guardian</span>
            <span className="font-medium">{ticket.guardianName}</span>
          </div>
          {ticket.childName && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Baby className="w-3.5 h-3.5" /> Child</span>
              <span className="font-medium">{ticket.childName}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> Phone</span>
            <span className="font-medium">{ticket.guardianPhone}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Date</span>
            <span className="font-medium">{dateFormatted}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3.5 h-3.5" /> Time</span>
            <span className="font-medium">{ticket.timeSlot}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground"><TicketIcon className="w-3.5 h-3.5" /> Type</span>
            <span className="font-medium">{getTicketTypeLabel(ticket.ticketType)}</span>
          </div>
        </div>

        {/* Price Breakdown */}
        {hasPricing && (
          <>
            <Separator className="my-3" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-center text-xs text-muted-foreground mb-2">💰 Price Details</p>
              {ticket.guardianCount && ticket.childCount && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Guardian + Child</span>
                  <span>{ticket.guardianCount} + {ticket.childCount}</span>
                </div>
              )}
              {ticket.entryPrice !== undefined && ticket.entryPrice > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entry</span>
                  <span>৳{ticket.entryPrice}</span>
                </div>
              )}
              {ticket.socksCount !== undefined && ticket.socksCount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Socks ({ticket.socksCount})</span>
                  <span>৳{ticket.socksPrice || 0}</span>
                </div>
              )}
              {ticket.addonsPrice !== undefined && ticket.addonsPrice > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rides</span>
                  <span>৳{ticket.addonsPrice}</span>
                </div>
              )}
              {ticket.discountApplied !== undefined && ticket.discountApplied > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Discount</span>
                  <span>-৳{ticket.discountApplied}</span>
                </div>
              )}
              <Separator className="my-1.5" />
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 text-white">
                <p className="text-[10px] opacity-80">Total</p>
                <p className="text-xl font-bold">৳{ticket.totalPrice}</p>
              </div>
            </div>
          </>
        )}

        <Separator className="my-3" />

        {/* Footer */}
        <div className="text-center text-[11px] text-muted-foreground space-y-0.5">
          <p>📍 Dhaka, Bangladesh</p>
          <p>📞 +880 1234-567890</p>
          <p className="mt-1.5 italic">Please show this ticket at entry</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>
    </div>
  );
}
