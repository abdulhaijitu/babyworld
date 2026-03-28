

## `/admin/bookings` মোবাইল রেসপনসিভ অপ্টিমাইজেশন

### সমস্যা (390px ভিউপোর্ট)

1. **স্ট্যাটস গ্রিড** — `grid-cols-2 lg:grid-cols-4` মোবাইলে ২x২ হয়ে অনেক জায়গা নেয়
2. **হেডার বাটন** — New Booking, Export, Refresh, View Toggle একসাথে 390px-এ overflow
3. **ফিল্টার** — ৪টি সিলেক্ট + ক্যালেন্ডার পপওভার মোবাইলে ভার্টিক্যালি স্ট্যাক হয়ে অনেক স্পেস নেয়
4. **টেবিল** — ৬ কলাম 390px-এ cramped, ড্রপডাউন অ্যাকশন দেখা যায় না
5. **BookingsListTab** — একই সমস্যা (আলাদা কম্পোনেন্ট, একই প্যাটার্ন)

### পরিকল্পনা

**ফাইল ১: `src/pages/admin/AdminBookings.tsx`**

**1. স্ট্যাটস ৪-কলাম কমপ্যাক্ট**
- `grid-cols-2 lg:grid-cols-4` → `grid-cols-4` সবসময়
- মোবাইলে `p-2`, ফন্ট `text-lg`, লেবেল `text-[10px]`
- `CardContent` সেকশন মোবাইলে হাইড (`hidden lg:block`)

**2. হেডার বাটন কমপ্যাক্ট**
- মোবাইলে বাটন টেক্সট হাইড, শুধু আইকন দেখানো
- View Toggle ছোট করা

**3. ফিল্টার ২-রো গ্রিড**
- সার্চ ফুল-উইডথ উপরে
- নিচে ৪টি ফিল্টার `grid grid-cols-4 gap-2` এ কমপ্যাক্ট, `h-8` ছোট ট্রিগার

**4. মোবাইলে কার্ড ভিউ, ডেস্কটপে টেবিল**
- `lg:hidden` — প্রতিটি বুকিং কমপ্যাক্ট কার্ড:
```text
┌─────────────────────────────────┐
│ 25 Mar 2026  [Confirmed] [Paid]│
│ 10:00-11:00 · Parent Name      │
│ 📞 01700... · Child+Guardian   │
│    [👁] [🖨] [💬] [✓] [✗]     │
└─────────────────────────────────┘
```
- `hidden lg:block` — বর্তমান টেবিল রাখা

**ফাইল ২: `src/components/admin/bookings/BookingsListTab.tsx`**

একই প্যাটার্ন প্রয়োগ:
- স্ট্যাটস `grid-cols-4` কমপ্যাক্ট
- ফিল্টার `grid-cols-3 gap-2`
- মোবাইল কার্ড ভিউ `lg:hidden`

### ফাইল
- `src/pages/admin/AdminBookings.tsx`
- `src/components/admin/bookings/BookingsListTab.tsx`

