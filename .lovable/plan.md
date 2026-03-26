

## Plan: Create Ticket ও Ticket List আলাদা পেজে বিভক্ত করা

### পরিবর্তন

#### 1. নতুন পেজ: `src/pages/admin/AdminCreateTicket.tsx`
- `AdminTicketing.tsx` থেকে Create Ticket সংক্রান্ত কোড আলাদা করা
- শুধু হেডার ("Create Ticket") + `<CounterTicketForm />` + `<TicketSuccessDialog />` থাকবে
- টিকেট তৈরি সফল হলে `navigate('/admin/ticketing')` দিয়ে Ticket List পেজে যাবে

#### 2. `src/pages/admin/AdminTicketing.tsx` আপডেট
- `searchParams` / `activeView` লজিক সরানো — সবসময় শুধু Ticket List দেখাবে
- হেডার সবসময় "Ticket List"
- Create Ticket সংক্রান্ত conditional rendering রিমুভ

#### 3. `src/App.tsx` — নতুন route যোগ
```tsx
<Route path="ticketing" element={<AdminTicketing />} />
<Route path="ticketing/create" element={<AdminCreateTicket />} />
```

#### 4. `src/components/admin/AdminSidebar.tsx` — path আপডেট
```tsx
children: [
  { id: 'ticketing-create', label: 'Create Ticket', icon: Plus, path: '/admin/ticketing/create' },
  { id: 'ticketing-list', label: 'Ticket List', icon: List, path: '/admin/ticketing' },
]
```

### ফাইল সারাংশ
| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminCreateTicket.tsx` | নতুন পেজ — Create Ticket ফর্ম |
| `src/pages/admin/AdminTicketing.tsx` | শুধু Ticket List রাখা, conditional লজিক সরানো |
| `src/App.tsx` | `ticketing/create` route যোগ |
| `src/components/admin/AdminSidebar.tsx` | সাবমেনু path আপডেট |

