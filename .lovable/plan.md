

## ফিক্স: মোবাইলে স্ক্রলিং সম্পূর্ণ সরানো

### সমস্যা
মোবাইল ভিউতে (390px) Rides কলামে `max-h-[40vh]` এবং Form কলামে `ScrollArea` আছে — ফলে দুটো আলাদা স্ক্রলযোগ্য এরিয়া তৈরি হচ্ছে।

### সমাধান
মোবাইলে কোনো `max-height` বা `ScrollArea` থাকবে না — সবকিছু ন্যাচারাল ফ্লোতে দেখাবে। শুধু ডেস্কটপে (`lg:`) স্ক্রল রাখা হবে।

### পরিবর্তন — `CounterTicketForm.tsx`

1. **Left column (Rides)** — লাইন 377:
   - `max-h-[40vh] lg:max-h-[75vh]` → `lg:max-h-[75vh]`
   - `overflow-hidden` শুধু `lg:overflow-hidden`
   - `ScrollArea` মোবাইলে সাধারণ `div`, ডেস্কটপে `ScrollArea` — অথবা সহজ সমাধান: `ScrollArea`-তে মোবাইলে `max-h` না থাকলে এটি স্বাভাবিকভাবে সব দেখাবে, তাই শুধু parent-এর `max-h` সরালেই হবে

2. **Right column (Form)** — লাইন 463:
   - `lg:max-h-[75vh]` রাখা, মোবাইলে কোনো height constraint নেই — ঠিক আছে
   - `ScrollArea` → মোবাইলে সাধারণ `div` হিসেবে কাজ করবে কারণ parent-এ `max-h` নেই

3. **Sticky submit button** — লাইন 681:
   - মোবাইলে sticky সরানো — `lg:sticky lg:bottom-0` অথবা সম্পূর্ণ সরানো কারণ স্ক্রল নেই

মূলত একটাই কাজ: **মোবাইলে `max-h-[40vh]` সরানো** এবং **`flex flex-col` থেকে `flex-col` সরানো** যাতে কন্টেন্ট ন্যাচারাল হাইট নেয়।

### টেকনিক্যাল ডিটেইলস

```text
আগে (মোবাইল):
┌─ Rides [40vh scroll] ──┐
│  ▼ scrollable           │
└─────────────────────────┘
┌─ Form [scroll area] ───┐
│  ▼ scrollable           │
└─────────────────────────┘

পরে (মোবাইল):
┌─ Rides (full height) ──┐
│  all rides visible      │
├─ Form (full height) ───┤
│  all fields visible     │
│  [Create Ticket]        │
└─────────────────────────┘
← পেইজ-লেভেল স্ক্রল only
```

### ফাইল
- `src/components/admin/ticketing/CounterTicketForm.tsx` — ৩-৪টি লাইন পরিবর্তন

