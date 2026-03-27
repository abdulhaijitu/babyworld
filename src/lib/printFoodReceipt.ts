import { format } from 'date-fns';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptData {
  orderNumber: string;
  items: ReceiptItem[];
  subtotal?: number;
  discount?: number;
  total: number;
  customerName?: string | null;
  paymentType: string;
  createdAt?: Date;
  isReprint?: boolean;
}

export function printFoodReceipt(data: ReceiptData) {
  const { orderNumber, items, total, customerName, paymentType, createdAt, isReprint } = data;
  const timeStr = format(createdAt || new Date(), 'dd/MM/yyyy hh:mm a');
  const logoUrl = new URL('/src/assets/baby-world-logo.png', window.location.origin).href;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const payment = paymentType;

  const itemsHtml = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'};">
      <td style="padding:4px 6px;font-size:12px;">${item.name}</td>
      <td style="padding:4px 6px;font-size:12px;text-align:center;">${item.quantity}</td>
      <td style="padding:4px 6px;font-size:12px;text-align:right;">৳${item.unitPrice}</td>
      <td style="padding:4px 6px;font-size:12px;text-align:right;font-weight:600;">৳${item.totalPrice}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><title>Receipt - ${orderNumber}</title>
    <style>
      @media print { @page { margin: 0; size: 80mm auto; } body { margin: 0; } }
      * { box-sizing: border-box; }
      body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; width: 76mm; margin: 0 auto; padding: 3mm; color: #1a1a1a; font-size: 12px; line-height: 1.4; }
      .header { text-align: center; padding-bottom: 8px; }
      .header img { height: 40px; margin-bottom: 4px; }
      .header h2 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
      .header .subtitle { margin: 2px 0 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
      .divider { border: none; border-top: 1px dashed #ccc; margin: 6px 0; }
      .divider-bold { border: none; border-top: 2px solid #333; margin: 6px 0; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px; font-size: 11px; }
      .info-grid .label { color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
      .info-grid .value { font-weight: 600; }
      table { width: 100%; border-collapse: collapse; }
      thead td { padding: 4px 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; letter-spacing: 0.3px; border-bottom: 1px solid #ddd; }
      .total-section { background: #f4f4f4; border-radius: 4px; padding: 8px; margin-top: 4px; }
      .total-row { display: flex; justify-content: space-between; align-items: center; }
      .total-label { font-size: 14px; font-weight: 700; }
      .total-amount { font-size: 18px; font-weight: 800; }
      .footer { text-align: center; margin-top: 8px; font-size: 9px; color: #999; }
      .footer .thanks { font-size: 11px; color: #333; font-weight: 600; margin-bottom: 2px; }
      .payment-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700; text-transform: uppercase;
        ${payment === 'cash' ? 'background:#e8f5e9;color:#2e7d32;' : payment === 'online' ? 'background:#e3f2fd;color:#1565c0;' : 'background:#fff3e0;color:#e65100;'} }
      .reprint { text-align: center; font-size: 9px; color: #999; margin-top: 4px; font-style: italic; }
    </style></head><body>
    <div class="header"><img src="${logoUrl}" alt="Baby World" /><h2>Baby World</h2><p class="subtitle">Food Court</p></div>
    <hr class="divider-bold" />
    <div class="info-grid">
      <div><span class="label">Order</span><br/><span class="value">${orderNumber}</span></div>
      <div><span class="label">Date</span><br/><span class="value">${timeStr}</span></div>
      ${customerName ? `<div><span class="label">Customer</span><br/><span class="value">${customerName}</span></div>` : ''}
      <div><span class="label">Payment</span><br/><span class="payment-badge">${payment === 'pending' ? 'Due' : payment}</span></div>
    </div>
    <hr class="divider" />
    <table><thead><tr><td>Item</td><td style="text-align:center;">Qty</td><td style="text-align:right;">Rate</td><td style="text-align:right;">Amount</td></tr></thead>
    <tbody>${itemsHtml}</tbody></table>
    <hr class="divider" />
    <div class="total-section">
      <div class="total-row"><span class="total-label">TOTAL</span><span class="total-amount">৳${total}</span></div>
      <div style="text-align:right;font-size:10px;color:#666;margin-top:2px;">${totalQty} item(s)</div>
    </div>
    <hr class="divider" />
    <div class="footer"><p class="thanks">Thank you for your order! 🎉</p><p>Baby World Indoor Playground</p><p>27/B, Jannat Tower, Lalbagh, Dhaka</p><p>📞 09606990128</p></div>
    ${isReprint ? '<p class="reprint">— Reprint —</p>' : ''}
  </body></html>`;

  const printWindow = window.open('', '_blank', 'width=350,height=500');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  }
}
