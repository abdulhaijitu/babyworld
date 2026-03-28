

## `/admin/membership-packages` মোবাইল রেসপনসিভ অপ্টিমাইজেশন

### সমস্যা চিহ্নিত (390px ভিউপোর্ট)

1. **টেবিল** — ৮ কলাম (SL, Name, Validity, Allowed Person, Price, Discount, Status, Action) 390px-এ overflow/cramped হয়
2. **ফর্ম ডায়ালগ** — `max-w-2xl` ও `grid-cols-2` মোবাইলে ইনপুট খুব ছোট হয়ে যায়, সাফিক্স ব্যাজ ওভারল্যাপ করে
3. **কন্টেইনার স্পেসিং** — `space-y-6` মোবাইলে বেশি
4. **সার্চ বার** — `max-w-sm` মোবাইলে ফুল-উইডথ হওয়া উচিত

### পরিবর্তন — `src/pages/admin/AdminMembershipPackages.tsx`

**1. মোবাইলে কার্ড ভিউ, ডেস্কটপে টেবিল**
- `lg:hidden` — প্রতিটি প্যাকেজ একটি কমপ্যাক্ট কার্ড:
```text
┌────────────────────────────────┐
│ Monthly Package    [Active] ⋮  │
│ ৳2,500 · 30 Days · G:2 K:1   │
└────────────────────────────────┘
```
- `hidden lg:block` — বর্তমান টেবিল রাখা

**2. ফর্ম ডায়ালগ মোবাইল অপ্টিমাইজ**
- `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` সব ফর্ম গ্রিডে
- ডায়ালগ `max-w-2xl` → `sm:max-w-2xl` (মোবাইলে ফুল-উইডথ)
- প্যাডিং `px-6` → `px-4 sm:px-6`

**3. হেডার ও সার্চ কমপ্যাক্ট**
- `space-y-6` → `space-y-4 lg:space-y-6`
- সার্চ `max-w-sm` → `w-full sm:max-w-sm`
- Create বাটন মোবাইলে ছোট

### ফাইল
- `src/pages/admin/AdminMembershipPackages.tsx`

