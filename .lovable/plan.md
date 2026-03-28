

## অডিট ও ফিক্স: `/admin/create-ticket` মোবাইল UI/UX

### সমস্যা চিহ্নিত

1. **ডুপ্লিকেট ফর্ম** — `AdminCreateTicket.tsx`-এ `<CounterTicketForm />` দুইবার রেন্ডার হচ্ছে (লাইন 31 ও 33) — পুরো ফর্ম ডবল দেখাচ্ছে
2. **`maxHeight: '75vh'` সমস্যা** — মোবাইলে দুটো কলাম (Rides + Form) প্রতিটিতে `75vh` ম্যাক্স হাইট → মোবাইলে কন্টেন্ট কাটা যায়, স্ক্রল অদ্ভুত লাগে
3. **Rides সেকশন মোবাইলে অতিরিক্ত জায়গা নেয়** — ফর্ম ফিল্ড দেখতে অনেক স্ক্রল করতে হয়
4. **বটম নেভ ওভারল্যাপ** — মোবাইল ডকের জন্য বটম স্পেসার নেই
5. **Visit history টেবিল** — ৩৯০px-এ ছোট টেক্সট, অনুভূমিক ওভারফ্লো সম্ভব

### সমাধান

**`AdminCreateTicket.tsx`**
- ডুপ্লিকেট `<CounterTicketForm />` সরানো (লাইন 33)

**`CounterTicketForm.tsx`**
- মোবাইলে `maxHeight: '75vh'` সরানো — `lg:max-h-[75vh]` শুধু ডেস্কটপে
- মোবাইলে Rides সেকশনের হাইট সীমিত করা (`max-h-[40vh]` মোবাইলে, `lg:max-h-none lg:flex-1`)
- বটম স্পেসার (`h-20`) যোগ করা মোবাইল ডকের জন্য
- Visit history টেবিলে `overflow-x-auto` যোগ
- Submit বাটন মোবাইলে sticky bottom করা যাতে সবসময় দেখা যায়

### টেকনিক্যাল ডিটেইলস

```text
মোবাইল লেআউট (আগে):
┌─ Rides (75vh scroll) ─┐
│  ...long list...       │
└────────────────────────┘
┌─ Form (75vh scroll) ──┐
│  ...fields...          │
└────────────────────────┘
← ফর্ম দেখতে অনেক স্ক্রল

মোবাইল লেআউট (পরে):
┌─ Rides (40vh max) ────┐
│  compact list          │
└────────────────────────┘
┌─ Form (auto height) ──┐
│  fields + pricing      │
│  [Create Ticket] sticky│
└────────────────────────┘
┌─ spacer (h-20) ───────┐
```

### ফাইল তালিকা
- `src/pages/admin/AdminCreateTicket.tsx` — ডুপ্লিকেট ফর্ম সরানো
- `src/components/admin/ticketing/CounterTicketForm.tsx` — মোবাইল রেসপন্সিভ ফিক্স

