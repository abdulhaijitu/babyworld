

## ফিক্স: `/admin/ticket-list` মোবাইল লেআউট অপ্টিমাইজ

### পরিবর্তন — `src/pages/admin/AdminTicketing.tsx`

**1. হেডার বাটন সেন্টার করা (লাইন 388)**
- `flex justify-end` → `flex justify-center lg:justify-end` — মোবাইলে বাটন সেন্টার, ডেস্কটপে ডানে

**2. ৪টি স্ট্যাটস কার্ড ১ রো-তে (লাইন 399-403)**
- `grid-cols-2 sm:grid-cols-4` → `grid-cols-4` — সবসময় ৪ কলাম
- কার্ডের ভেতরের প্যাডিং আরও কমিয়ে `p-2 pb-1`, টাইটেল `text-lg`, আইকন/লেবেল `text-[10px]` করা

**3. ফিল্টার + কাউন্ট + রিফ্রেশ এক রো-তে (লাইন 443-517)**
- তিনটি আলাদা ব্লক (Search, Filters, Count+Refresh) কে একটি `flex flex-wrap gap-2 items-center` এ নেওয়া
- Search ইনপুটের width কমানো (`w-full lg:w-auto lg:flex-1`)
- Count badge + Refresh বাটন ফিল্টারের পাশে `ml-auto` দিয়ে রাখা
- মোবাইলে: `[Search full-width]` তারপর `[Status | From | To | Clear | Count | Refresh]` এক রো-তে

```text
মোবাইল (পরে):
┌──────────────────────────────┐
│   [Create Ticket] [Scan QR]  │  ← centered
├──────────────────────────────┤
│ [Active][Today][Inside][Used]│  ← 4 cols compact
├──────────────────────────────┤
│ [🔍 Search..................]│
│ [All▾][From][To][x] [50][⟳] │  ← one row
└──────────────────────────────┘
```

### ফাইল
- `src/pages/admin/AdminTicketing.tsx`

