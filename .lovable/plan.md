

## Plan: Ticket Print Preview অডিট ও ফিক্স

### সমস্যা চিহ্নিত

1. **Print Output ভাঙা** — `TicketSuccessDialog` এর `printRef` innerHTML কপি করে print window-এ দেয়, কিন্তু Tailwind CSS classes (`text-primary`, `text-muted-foreground`, `bg-muted/50`) print window-এ কাজ করে না। ফলে print-এ colors, spacing, badges সব ভাঙা দেখায়।

2. **Price Breakdown নেই** — TicketSuccessDialog শুধু `total_price` দেখায়, কিন্তু Entry Fee, Socks, Rides, Discount আলাদাভাবে দেখায় না (যদিও `price_breakdown` ডাটা আসে)।

3. **Separator/Badge print-এ render হয় না** — React components innerHTML-এ Tailwind ছাড়া ঠিকমতো দেখায় না।

4. **দুটি আলাদা print design** — `PrintableTicket` ও `TicketSuccessDialog` আলাদা design ও interface ব্যবহার করে, inconsistent।

### সমাধান

#### `TicketSuccessDialog.tsx` — সম্পূর্ণ রিফ্যাক্টর

**Print approach পরিবর্তন**: innerHTML কপি না করে, `handlePrint` ফাংশনে সরাসরি pure HTML string generate করা হবে। এতে Tailwind dependency থাকবে না।

**Dialog preview ফিক্স:**
- Price breakdown section যোগ (Entry, Socks, Rides, Discount → Grand Total)
- Time box styling ঠিক করা
- Payment badge সঠিকভাবে দেখানো

**Print output ফিক্স:**
- Pure HTML/CSS দিয়ে print content generate (no innerHTML copy)
- Logo base64 বা absolute URL ব্যবহার
- QR code SVG string generate করা
- Rides list, price breakdown, time box সব print-এ সঠিকভাবে দেখাবে

**Print HTML structure:**
```text
┌─── Dashed Border ─────────────────┐
│     [Logo]                        │
│  Baby World Indoor Playground     │
│                                   │
│     [QR Code 180px]               │
│     Scan at gate                  │
│                                   │
│  Ticket: TK-XXXXXX               │
│  ─────────────────────────        │
│  Guardian: Name     Phone: 01XX   │
│  Date: 26 Mar 2026               │
│  ─────────────────────────        │
│  IN: 10:30 AM  →  OUT: 11:30 AM  │
│  ─────────────────────────        │
│  Guardians: 1    Children: 1     │
│  Socks: 2 pairs                   │
│  ─────────────────────────        │
│  Rides:                           │
│    Horse Ride ×2      ৳340       │
│    Bike Race ×1       ৳230       │
│  ─────────────────────────        │
│  Entry Fee            ৳500       │
│  Socks (2)            ৳100       │
│  Rides                ৳570       │
│  Member Discount     -৳50        │
│  ═══════════════════════          │
│  TOTAL               ৳1,120      │
│  Cash • Paid                      │
│  ─────────────────────────        │
│  Thank you! Visit again.          │
└───────────────────────────────────┘
```

#### `PrintableTicket.tsx` — একই approach

Print HTML direct generate করবে, innerHTML copy নয়। Design consistent থাকবে TicketSuccessDialog-এর সাথে।

### ফাইল পরিবর্তন

| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/admin/ticketing/TicketSuccessDialog.tsx` | Print function রিফ্যাক্টর (pure HTML generate), price breakdown যোগ, dialog preview ফিক্স |
| `src/components/admin/PrintableTicket.tsx` | Same pure HTML print approach, consistent design |

DB migration লাগবে না।

