

## `/admin/rides` মোবাইল রেসপনসিভ অপ্টিমাইজেশন

### সমস্যা চিহ্নিত (390px ভিউপোর্ট)

1. **স্ট্যাটস কার্ড** — `grid-cols-2 sm:grid-cols-3 md:grid-cols-5` → মোবাইলে ২ কলাম, ৫টি কার্ডের শেষটি একা থাকে
2. **কন্ট্রোল বার** — Show entries + Category + Search তিনটি আলাদা ব্লকে, জায়গা নষ্ট
3. **টেবিল** — ৮টি কলাম (SL, Image, Name, Type, Price, Offer, Status, Action) মোবাইলে overflow হয়, পড়া কঠিন
4. **পেজিনেশন** — Previous/Next টেক্সট সহ বাটন মোবাইলে অনেক জায়গা নেয়
5. **ডায়ালগ** — `max-w-xl` মোবাইলে ভালো কাজ করে তবে ফর্ম স্ক্রলিং ইস্যু থাকতে পারে

### পরিবর্তন — `src/pages/admin/AdminRides.tsx`

**1. স্ট্যাটস কার্ড কমপ্যাক্ট (লাইন 334-365)**
- `grid-cols-2 sm:grid-cols-3 md:grid-cols-5` → `grid-cols-5 gap-2 lg:gap-4`
- কার্ড প্যাডিং: `p-2 pb-1 lg:p-4 lg:pb-2`
- ফন্ট সাইজ: আইকন+লেবেল `text-[10px] lg:text-xs`, টাইটেল `text-lg lg:text-2xl`

**2. কন্ট্রোল বার কমপ্যাক্ট (লাইন 374-402)**
- `flex flex-col sm:flex-row` → `flex flex-wrap items-center gap-2`
- Show entries শুধু সিলেক্ট রাখা (Show/entries টেক্সট মোবাইলে `hidden lg:inline`)
- Category সিলেক্ট `w-[90px]`
- Search `flex-1 min-w-[120px]`

**3. মোবাইলে কার্ড ভিউ, ডেস্কটপে টেবিল (লাইন 414-484)**
- `lg:` breakpoint এ টেবিল দেখানো
- মোবাইলে প্রতিটি রাইড একটি কমপ্যাক্ট কার্ড: Image + Name + Type + Price + Status + Action বাটন
- কার্ড লেআউট: `flex items-center gap-3` — বাম দিকে ইমেজ, মাঝে তথ্য, ডানে অ্যাকশন

```text
মোবাইল কার্ড:
┌─────────────────────────────┐
│ [IMG] Ferris Wheel    [✏][🗑]│
│       Paid · ৳200  ● Active │
└─────────────────────────────┘
```

**4. পেজিনেশন কমপ্যাক্ট (লাইন 488-518)**
- Previous/Next → শুধু আইকন `<` `>` মোবাইলে
- "Showing X to Y" → `text-xs`

**5. মূল কন্টেইনার (লাইন 324)**
- `space-y-6` → `space-y-4 lg:space-y-6`

### ফাইল
- `src/pages/admin/AdminRides.tsx`

