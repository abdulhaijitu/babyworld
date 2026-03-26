import { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, X, Check, Clock, User, Phone, Calendar, Ticket } from 'lucide-react';
import babyWorldLogo from '@/assets/baby-world-logo.png';

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

function generatePrintHTML(ticket: NonNullable<TicketSuccessDialogProps['ticket']>, rideNames: Record<string, string>, qrSvgString: string, logoUrl: string): string {
  const inTime = format(new Date(ticket.in_time), 'hh:mm a');
  const outTime = format(new Date(ticket.out_time), 'hh:mm a');
  const pb = ticket.price_breakdown;
  const hasRides = ticket.rides && ticket.rides.length > 0;

  const ridesListHTML = hasRides ? `
    <div class="rides-section">
      <div class="rides-title">🎠 Rides</div>
      ${ticket.rides!.map((r, i) => `
        <div class="ride-item">
          <span>${rideNames[r.ride_id] || `Ride ${i + 1}`} ×${r.quantity}</span>
          <span>৳${r.total_price}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  const breakdownHTML = pb ? `
    <div class="breakdown">
      ${pb.entry_price > 0 ? `<div class="info-row"><span class="label">Entry Fee</span><span class="value">৳${pb.entry_price}</span></div>` : ''}
      ${pb.socks_price > 0 ? `<div class="info-row"><span class="label">Socks (${ticket.socks_count})</span><span class="value">৳${pb.socks_price}</span></div>` : ''}
      ${pb.rides_price > 0 ? `<div class="info-row"><span class="label">Rides</span><span class="value">৳${pb.rides_price}</span></div>` : ''}
      ${pb.discount_amount > 0 ? `<div class="info-row discount"><span class="label">${pb.membership_applied ? 'Member Discount' : 'Discount'}</span><span class="value">-৳${pb.discount_amount}</span></div>` : ''}
      <div class="total-divider"></div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html><head><title>Ticket - ${ticket.ticket_number}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI','Hind Siliguri',Arial,sans-serif;padding:20px;max-width:380px;margin:0 auto;background:#fff;color:#333}
.ticket{border:2px dashed #e91e63;border-radius:16px;padding:24px 20px}
.header{text-align:center;padding-bottom:14px;border-bottom:1px dashed #ddd;margin-bottom:14px}
.header img{height:48px;margin:0 auto 6px;display:block}
.header h2{font-size:15px;color:#333;font-weight:700}
.header p{font-size:11px;color:#888}
.ticket-num{text-align:center;margin:12px 0;font-size:18px;font-weight:bold;letter-spacing:2px;color:#e91e63;background:#fce4ec;padding:8px 16px;border-radius:20px;display:inline-block}
.ticket-num-wrap{text-align:center}
.qr-wrap{text-align:center;margin:16px 0;padding:14px;background:#fafafa;border-radius:12px}
.qr-wrap svg{width:180px!important;height:180px!important}
.qr-wrap p{font-size:10px;color:#999;margin-top:6px}
.info-row{display:flex;justify-content:space-between;margin:5px 0;font-size:13px}
.label{color:#666}
.value{font-weight:600}
.sep{border-top:1px dashed #ddd;margin:12px 0}
.time-box{background:linear-gradient(135deg,#fce4ec 0%,#f8bbd0 100%);padding:14px;border-radius:12px;margin:14px 0;display:flex;align-items:center;justify-content:space-around}
.time-item{text-align:center}
.time-label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px}
.time-value{font-size:22px;font-weight:bold;color:#c2185b}
.time-arrow{font-size:22px;color:#e91e63}
.counts{display:flex;gap:12px;justify-content:center;margin:10px 0}
.count-chip{background:#f5f5f5;padding:6px 14px;border-radius:16px;font-size:12px;font-weight:500}
.rides-section{background:#f5f5f5;padding:12px;border-radius:10px;margin:12px 0}
.rides-title{font-size:12px;font-weight:600;color:#666;margin-bottom:6px}
.ride-item{display:flex;justify-content:space-between;font-size:12px;margin:3px 0}
.breakdown .info-row{font-size:13px}
.breakdown .discount{color:#4caf50}
.total-divider{border-top:2px solid #e91e63;margin:8px 0}
.total-box{text-align:center;padding:16px;background:linear-gradient(135deg,#e91e63,#c2185b);border-radius:12px;color:#fff;margin:12px 0}
.total-label{font-size:11px;opacity:.85}
.total-amount{font-size:30px;font-weight:bold}
.payment-badge{display:inline-block;background:rgba(255,255,255,.2);padding:4px 14px;border-radius:12px;font-size:11px;margin-top:6px}
.footer{text-align:center;font-size:11px;color:#888;margin-top:14px;padding-top:12px;border-top:1px dashed #ddd}
@media print{body{padding:0}.ticket{border:2px dashed #e91e63!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body><div class="ticket">
  <div class="header">
    <img src="${logoUrl}" alt="Baby World"/>
    <h2>Baby World Indoor Playground</h2>
    <p>Safe Fun for Kids!</p>
  </div>
  <div class="ticket-num-wrap"><span class="ticket-num">🎫 ${ticket.ticket_number}</span></div>
  <div class="qr-wrap">${qrSvgString}<p>Scan at gate</p></div>
  <div class="info-row"><span class="label">👤 Guardian</span><span class="value">${ticket.guardian_name}</span></div>
  <div class="info-row"><span class="label">📞 Phone</span><span class="value">${ticket.guardian_phone}</span></div>
  <div class="info-row"><span class="label">📅 Date</span><span class="value">${ticket.slot_date}</span></div>
  <div class="sep"></div>
  <div class="time-box">
    <div class="time-item"><div class="time-label">IN</div><div class="time-value">${inTime}</div></div>
    <div class="time-arrow">→</div>
    <div class="time-item"><div class="time-label">OUT</div><div class="time-value">${outTime}</div></div>
  </div>
  <div class="counts">
    <span class="count-chip">👤 Guardian: ${ticket.guardian_count}</span>
    <span class="count-chip">👶 Child: ${ticket.child_count}</span>
    ${ticket.socks_count > 0 ? `<span class="count-chip">🧦 Socks: ${ticket.socks_count}</span>` : ''}
  </div>
  ${ridesListHTML}
  <div class="sep"></div>
  ${breakdownHTML}
  <div class="total-box">
    <div class="total-label">Total Amount</div>
    <div class="total-amount">৳${ticket.total_price}</div>
    <div class="payment-badge">${ticket.payment_type === 'cash' ? 'Cash' : 'Online'} • ${ticket.payment_status === 'paid' ? 'Paid' : 'Pending'}</div>
  </div>
  <div class="footer">
    <p>🎉 Thank you! Visit again.</p>
    <p style="margin-top:4px">Baby World Indoor Playground</p>
  </div>
</div></body></html>`;
}

export function TicketSuccessDialog({ open, onClose, ticket, rideNames = {} }: TicketSuccessDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!ticket) return null;

  const inTime = new Date(ticket.in_time);
  const outTime = new Date(ticket.out_time);
  const hasRides = ticket.rides && ticket.rides.length > 0;
  const pb = ticket.price_breakdown;

  const handlePrint = useCallback(() => {
    if (!qrRef.current) return;
    const qrSvg = qrRef.current.querySelector('svg');
    const qrSvgString = qrSvg ? qrSvg.outerHTML : '';

    // Convert logo to absolute URL
    const logoUrl = new URL(babyWorldLogo, window.location.origin).href;

    const html = generatePrintHTML(ticket, rideNames, qrSvgString, logoUrl);
    const printWindow = window.open('', '', 'width=450,height=800');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }, [ticket, rideNames]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Ticket Created Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Header */}
          <div className="text-center">
            <img src={babyWorldLogo} alt="Baby World" className="h-10 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Indoor Playground</p>
          </div>

          {/* Ticket Number */}
          <div className="text-center">
            <Badge variant="outline" className="text-base px-4 py-1.5 bg-pink-50 text-pink-700 border-pink-200">
              <Ticket className="h-4 w-4 mr-2" />
              {ticket.ticket_number}
            </Badge>
          </div>

          {/* QR Code (hidden ref for print extraction) */}
          <div ref={qrRef} className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
              <QRCodeSVG
                value={ticket.ticket_number}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Scan at gate</p>
          </div>

          {/* Customer Info */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Guardian</span>
              <span className="font-medium">{ticket.guardian_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
              <span className="font-medium">{ticket.guardian_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</span>
              <span className="font-medium">{ticket.slot_date}</span>
            </div>
          </div>

          <Separator />

          {/* Time Box */}
          <div className="flex items-center justify-around p-3 rounded-xl bg-pink-50 border border-pink-100">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IN</p>
              <p className="text-lg font-bold text-pink-700">{format(inTime, 'hh:mm a')}</p>
            </div>
            <Clock className="h-5 w-5 text-pink-400" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">OUT</p>
              <p className="text-lg font-bold text-pink-700">{format(outTime, 'hh:mm a')}</p>
            </div>
          </div>

          {/* Counts */}
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary" className="text-xs">👤 Guardian: {ticket.guardian_count}</Badge>
            <Badge variant="secondary" className="text-xs">👶 Child: {ticket.child_count}</Badge>
            {ticket.socks_count > 0 && (
              <Badge variant="secondary" className="text-xs">🧦 Socks: {ticket.socks_count}</Badge>
            )}
          </div>

          {/* Rides */}
          {hasRides && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-1">🎠 Rides</p>
                {ticket.rides!.map((ride, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {rideNames[ride.ride_id] || `Ride ${i + 1}`} ×{ride.quantity}
                    </span>
                    <span className="font-medium">৳{ride.total_price}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />

          {/* Price Breakdown */}
          {pb && (
            <div className="space-y-1 text-sm">
              {pb.entry_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span>৳{pb.entry_price}</span>
                </div>
              )}
              {pb.socks_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Socks ({ticket.socks_count})</span>
                  <span>৳{pb.socks_price}</span>
                </div>
              )}
              {pb.rides_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rides</span>
                  <span>৳{pb.rides_price}</span>
                </div>
              )}
              {pb.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{pb.membership_applied ? 'Member Discount' : 'Discount'}</span>
                  <span>-৳{pb.discount_amount}</span>
                </div>
              )}
              <Separator className="my-1" />
            </div>
          )}

          {/* Total */}
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 text-white">
            <p className="text-xs opacity-80">Total Amount</p>
            <p className="text-2xl font-bold">৳{ticket.total_price}</p>
            <span className="inline-block mt-1 text-[11px] bg-white/20 px-3 py-0.5 rounded-full">
              {ticket.payment_type === 'cash' ? 'Cash' : 'Online'} • {ticket.payment_status === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-dashed">
            <p>🎉 Thank you! Visit again.</p>
            <p className="mt-0.5">Baby World Indoor Playground</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
