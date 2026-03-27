const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface PayslipData {
  employeeName: string;
  employeeRole: string;
  month: number;
  year: number;
  basicSalary: number;
  deductions: number;
  bonuses: number;
  netSalary: number;
  status: string;
  paidAt?: string | null;
  notes?: string | null;
}

export function printPayslip(data: PayslipData) {
  const logoUrl = new URL('/src/assets/baby-world-logo.png', window.location.origin).href;
  const now = new Date();
  const printDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const monthName = months[data.month - 1];

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Payslip - ${data.employeeName} - ${monthName} ${data.year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a1a; }
  .payslip { max-width: 700px; margin: 0 auto; border: 2px solid #333; }
  .header { background: #1e3a5f; color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
  .header img { height: 50px; }
  .header-text { text-align: right; }
  .header-text h1 { font-size: 22px; letter-spacing: 2px; }
  .header-text p { font-size: 11px; opacity: 0.8; margin-top: 2px; }
  .period-bar { background: #f0f4f8; padding: 10px 24px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 13px; }
  .section { padding: 16px 24px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .info-item { display: flex; justify-content: space-between; }
  .info-label { color: #666; font-size: 13px; }
  .info-value { font-weight: 600; font-size: 13px; }
  .salary-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .salary-table th { text-align: left; padding: 8px 12px; background: #f7f9fb; border: 1px solid #e2e8f0; font-size: 12px; color: #555; text-transform: uppercase; }
  .salary-table td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  .salary-table .amount { text-align: right; font-family: 'Courier New', monospace; }
  .salary-table .deduction { color: #dc2626; }
  .salary-table .bonus { color: #16a34a; }
  .net-row { background: #1e3a5f; color: white; }
  .net-row td { font-weight: 700; font-size: 16px; border-color: #1e3a5f; }
  .status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .status-paid { background: #dcfce7; color: #166534; }
  .status-draft { background: #fef9c3; color: #854d0e; }
  .footer { padding: 16px 24px; border-top: 2px dashed #ccc; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
  .signatures { padding: 30px 24px 16px; display: flex; justify-content: space-between; }
  .sig-box { text-align: center; width: 180px; }
  .sig-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; font-size: 12px; color: #555; }
  @media print {
    body { padding: 0; }
    .payslip { border: none; }
    @page { margin: 15mm; }
  }
</style>
</head>
<body>
<div class="payslip">
  <div class="header">
    <img src="${logoUrl}" alt="Baby World" onerror="this.style.display='none'" />
    <div class="header-text">
      <h1>PAYSLIP</h1>
      <p>Baby World Indoor Playground</p>
    </div>
  </div>

  <div class="period-bar">
    <span><strong>Pay Period:</strong> ${monthName} ${data.year}</span>
    <span><strong>Print Date:</strong> ${printDate}</span>
  </div>

  <div class="section">
    <div class="section-title">Employee Information</div>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Name</span><span class="info-value">${data.employeeName}</span></div>
      <div class="info-item"><span class="info-label">Role</span><span class="info-value" style="text-transform:capitalize">${data.employeeRole}</span></div>
      <div class="info-item"><span class="info-label">Status</span><span><span class="status-badge ${data.status === 'paid' ? 'status-paid' : 'status-draft'}">${data.status === 'paid' ? 'PAID' : 'DRAFT'}</span></span></div>
      ${data.paidAt ? `<div class="info-item"><span class="info-label">Paid On</span><span class="info-value">${new Date(data.paidAt).toLocaleDateString('en-GB')}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Salary Breakdown</div>
    <table class="salary-table">
      <thead>
        <tr><th>Description</th><th style="text-align:right">Amount (৳)</th></tr>
      </thead>
      <tbody>
        <tr><td>Basic Salary</td><td class="amount">${Number(data.basicSalary).toLocaleString()}</td></tr>
        <tr><td>Bonuses / Allowances</td><td class="amount bonus">+${Number(data.bonuses).toLocaleString()}</td></tr>
        <tr><td>Deductions</td><td class="amount deduction">-${Number(data.deductions).toLocaleString()}</td></tr>
        <tr class="net-row"><td>Net Salary</td><td class="amount">৳${Number(data.netSalary).toLocaleString()}</td></tr>
      </tbody>
    </table>
  </div>

  ${data.notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:13px;color:#555">${data.notes}</p></div>` : ''}

  <div class="signatures">
    <div class="sig-box"><div class="sig-line">Employee Signature</div></div>
    <div class="sig-box"><div class="sig-line">Authorized Signature</div></div>
  </div>

  <div class="footer">
    <span>This is a computer-generated payslip.</span>
    <span>Baby World Indoor Playground</span>
  </div>
</div>

<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function printBulkPayslips(payslips: PayslipData[]) {
  if (payslips.length === 0) return;

  const logoUrl = new URL('/src/assets/baby-world-logo.png', window.location.origin).href;
  const now = new Date();
  const printDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const pages = payslips.map(data => {
    const monthName = months[data.month - 1];
    return `
  <div class="payslip" style="page-break-after: always;">
    <div class="header">
      <img src="${logoUrl}" alt="Baby World" onerror="this.style.display='none'" />
      <div class="header-text">
        <h1>PAYSLIP</h1>
        <p>Baby World Indoor Playground</p>
      </div>
    </div>
    <div class="period-bar">
      <span><strong>Pay Period:</strong> ${monthName} ${data.year}</span>
      <span><strong>Print Date:</strong> ${printDate}</span>
    </div>
    <div class="section">
      <div class="section-title">Employee Information</div>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">Name</span><span class="info-value">${data.employeeName}</span></div>
        <div class="info-item"><span class="info-label">Role</span><span class="info-value" style="text-transform:capitalize">${data.employeeRole}</span></div>
        <div class="info-item"><span class="info-label">Status</span><span><span class="status-badge ${data.status === 'paid' ? 'status-paid' : 'status-draft'}">${data.status === 'paid' ? 'PAID' : 'DRAFT'}</span></span></div>
        ${data.paidAt ? `<div class="info-item"><span class="info-label">Paid On</span><span class="info-value">${new Date(data.paidAt).toLocaleDateString('en-GB')}</span></div>` : ''}
      </div>
    </div>
    <div class="section">
      <div class="section-title">Salary Breakdown</div>
      <table class="salary-table">
        <thead><tr><th>Description</th><th style="text-align:right">Amount (৳)</th></tr></thead>
        <tbody>
          <tr><td>Basic Salary</td><td class="amount">${Number(data.basicSalary).toLocaleString()}</td></tr>
          <tr><td>Bonuses / Allowances</td><td class="amount bonus">+${Number(data.bonuses).toLocaleString()}</td></tr>
          <tr><td>Deductions</td><td class="amount deduction">-${Number(data.deductions).toLocaleString()}</td></tr>
          <tr class="net-row"><td>Net Salary</td><td class="amount">৳${Number(data.netSalary).toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>
    ${data.notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:13px;color:#555">${data.notes}</p></div>` : ''}
    <div class="signatures">
      <div class="sig-box"><div class="sig-line">Employee Signature</div></div>
      <div class="sig-box"><div class="sig-line">Authorized Signature</div></div>
    </div>
    <div class="footer">
      <span>This is a computer-generated payslip.</span>
      <span>Baby World Indoor Playground</span>
    </div>
  </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bulk Payslips</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a1a; }
  .payslip { max-width: 700px; margin: 0 auto 30px; border: 2px solid #333; }
  .header { background: #1e3a5f; color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
  .header img { height: 50px; }
  .header-text { text-align: right; }
  .header-text h1 { font-size: 22px; letter-spacing: 2px; }
  .header-text p { font-size: 11px; opacity: 0.8; margin-top: 2px; }
  .period-bar { background: #f0f4f8; padding: 10px 24px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 13px; }
  .section { padding: 16px 24px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .info-item { display: flex; justify-content: space-between; }
  .info-label { color: #666; font-size: 13px; }
  .info-value { font-weight: 600; font-size: 13px; }
  .salary-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .salary-table th { text-align: left; padding: 8px 12px; background: #f7f9fb; border: 1px solid #e2e8f0; font-size: 12px; color: #555; text-transform: uppercase; }
  .salary-table td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  .salary-table .amount { text-align: right; font-family: 'Courier New', monospace; }
  .salary-table .deduction { color: #dc2626; }
  .salary-table .bonus { color: #16a34a; }
  .net-row { background: #1e3a5f; color: white; }
  .net-row td { font-weight: 700; font-size: 16px; border-color: #1e3a5f; }
  .status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .status-paid { background: #dcfce7; color: #166534; }
  .status-draft { background: #fef9c3; color: #854d0e; }
  .footer { padding: 16px 24px; border-top: 2px dashed #ccc; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
  .signatures { padding: 30px 24px 16px; display: flex; justify-content: space-between; }
  .sig-box { text-align: center; width: 180px; }
  .sig-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; font-size: 12px; color: #555; }
  @media print { body { padding: 0; } .payslip { border: none; margin-bottom: 0; } @page { margin: 15mm; } }
</style></head><body>${pages}
<script>window.onload = function() { window.print(); }<\/script>
</body></html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
