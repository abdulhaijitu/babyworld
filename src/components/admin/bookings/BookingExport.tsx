import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Booking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  ticket_type: string;
  booking_type: string;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

interface BookingExportProps {
  bookings: Booking[];
}

export function BookingExport({ bookings }: BookingExportProps) {
  const { language } = useLanguage();

  const getTicketTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      child_guardian: 'Child + Guardian',
      child_only: 'Child Only',
      group: 'Group'
    };
    return labels[type] || type;
  };

  const getBookingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hourly_play: 'Hourly Play',
      birthday_event: 'Birthday Event',
      private_event: 'Private Event'
    };
    return labels[type] || type;
  };

  const exportToCSV = () => {
    if (bookings.length === 0) {
      toast.error(language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings to export');
      return;
    }

    const headers = [
      'Booking ID',
      'Date',
      'Time Slot',
      'Parent Name',
      'Phone',
      'Ticket Type',
      'Booking Type',
      'Status',
      'Payment Status',
      'Notes',
      'Created At'
    ];

    const rows = bookings.map(b => [
      b.id,
      b.slot_date,
      b.time_slot,
      b.parent_name,
      b.parent_phone,
      getTicketTypeLabel(b.ticket_type),
      getBookingTypeLabel(b.booking_type),
      b.status,
      b.payment_status,
      b.notes || '',
      format(parseISO(b.created_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(language === 'bn' ? 'CSV ফাইল ডাউনলোড হয়েছে' : 'CSV file downloaded');
  };

  const exportToPDF = () => {
    if (bookings.length === 0) {
      toast.error(language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error(language === 'bn' ? 'পপ-আপ ব্লক করা হয়েছে' : 'Popup blocked');
      return;
    }

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const paidBookings = bookings.filter(b => b.payment_status === 'paid').length;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Report - Baby World</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #7c3aed;
          }
          .header h1 { color: #7c3aed; font-size: 24px; }
          .header p { color: #666; margin-top: 5px; }
          .stats { 
            display: flex; 
            gap: 20px; 
            margin-bottom: 20px;
            justify-content: center;
          }
          .stat-card {
            padding: 10px 20px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
          }
          .stat-card .number { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .stat-card .label { font-size: 12px; color: #666; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
          }
          th { 
            background: #7c3aed; 
            color: white;
          }
          tr:nth-child(even) { background: #f9f9f9; }
          .status-confirmed { color: #16a34a; }
          .status-pending { color: #ca8a04; }
          .status-cancelled { color: #dc2626; }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #999;
            font-size: 10px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Baby World Indoor Playground</h1>
          <p>Booking Report - Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="number">${totalBookings}</div>
            <div class="label">Total Bookings</div>
          </div>
          <div class="stat-card">
            <div class="number">${confirmedBookings}</div>
            <div class="label">Confirmed</div>
          </div>
          <div class="stat-card">
            <div class="number">${paidBookings}</div>
            <div class="label">Paid</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Time</th>
              <th>Parent</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map((b, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${b.slot_date}</td>
                <td>${b.time_slot}</td>
                <td>${b.parent_name}</td>
                <td>${b.parent_phone}</td>
                <td>${getTicketTypeLabel(b.ticket_type)}</td>
                <td class="status-${b.status}">${b.status}</td>
                <td>${b.payment_status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Baby World Indoor Playground - Dhaka, Bangladesh</p>
          <p>This is a computer-generated report</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    toast.success(language === 'bn' ? 'PDF প্রিন্ট উইন্ডো খোলা হয়েছে' : 'PDF print window opened');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'এক্সপোর্ট' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'CSV ফাইল' : 'Export CSV'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'PDF প্রিন্ট' : 'Print PDF'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
