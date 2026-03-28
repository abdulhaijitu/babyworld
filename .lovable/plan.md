

## `/admin/events` মোবাইল রেসপনসিভ অপ্টিমাইজেশন

তিনটি সাব-পেইজ আছে: Events (bookings list), Event Packages, Event Calendar। সবগুলোতে মোবাইল সমস্যা আছে।

### সমস্যা চিহ্নিত (390px ভিউপোর্ট)

**AdminEvents.tsx:**
1. স্ট্যাটস `grid-cols-2 lg:grid-cols-4` — মোবাইলে ২x২ হয়ে অনেক জায়গা নেয়
2. ফিল্টার `flex-col md:flex-row` — মোবাইলে ভার্টিক্যালি স্ট্যাক হয়ে স্পেস নেয়
3. ৬-কলাম টেবিল 390px-এ cramped, ড্রপডাউন অ্যাকশন কাজ করে না ভালো
4. New Event বাটন টেক্সটসহ — মোবাইলে আইকন-অনলি হলে ভালো

**AdminEventPackages.tsx:**
1. ১০-কলাম টেবিল (drag, #, image, name, price, guests, duration, features, status, actions) — মোবাইলে সম্পূর্ণ ভাঙা
2. কোনো মোবাইল কার্ড ভিউ নেই

**AdminEventCalendar.tsx:**
1. `grid-cols-1 lg:grid-cols-3` — মোবাইলে ক্যালেন্ডার + ইভেন্ট তালিকা ভার্টিক্যালি স্ট্যাক, ঠিক আছে কিন্তু ক্যালেন্ডার হেডার বাটন টাইট
2. সামগ্রিকভাবে এটি তুলনামূলক ভালো

---

### পরিকল্পনা

**ফাইল ১: `src/pages/admin/AdminEvents.tsx`**

1. **স্ট্যাটস** — `grid-cols-4` সবসময়, `p-2`, `text-lg` ভ্যালু, `text-[10px]` লেবেল
2. **হেডার** — New Event বাটন মোবাইলে আইকন-অনলি, Refresh আইকন-অনলি
3. **ফিল্টার** — সার্চ ফুল-উইডথ উপরে, নিচে type + status `grid-cols-2 gap-2` এ `h-8` ছোট ট্রিগার
4. **মোবাইল কার্ড ভিউ** (`lg:hidden`):
```text
┌─────────────────────────────────┐
│ 25 Mar 2026  [Birthday][Confirmed]│
│ 10:00-1:00 · Parent Name         │
│ 📞 01700...            [Paid]    │
│    [👁] [✓Confirm] [💰Paid] [✗] │
└─────────────────────────────────┘
```
5. ডেস্কটপে বর্তমান টেবিল রাখা (`hidden lg:block`)

**ফাইল ২: `src/pages/admin/AdminEventPackages.tsx`**

1. **মোবাইল কার্ড ভিউ** (`lg:hidden`) — প্রতিটি প্যাকেজ কার্ড:
```text
┌─────────────────────────────────┐
│ [img] Package Name    [Active]  │
│ ৳5,000 · 30 guests · 3h        │
│ [feature] [feature] [+2]       │
│         [✏️ Edit] [🗑 Delete]   │
└─────────────────────────────────┘
```
2. ডেস্কটপে বর্তমান টেবিল রাখা (`hidden lg:block`)
3. হেডার বাটন — Refresh মোবাইলে আইকন-অনলি

**ফাইল ৩: `src/pages/admin/AdminEventCalendar.tsx`**

1. ক্যালেন্ডার হেডার — "Today" বাটন মোবাইলে ছোট (`text-xs h-7`)
2. ইভেন্ট কার্ড — ছোট প্যাডিং `p-2`
3. সামগ্রিকভাবে ছোট পরিবর্তন — এটি ইতিমধ্যে যুক্তিসঙ্গতভাবে রেসপনসিভ

### ফাইল
- `src/pages/admin/AdminEvents.tsx`
- `src/pages/admin/AdminEventPackages.tsx`
- `src/pages/admin/AdminEventCalendar.tsx`

