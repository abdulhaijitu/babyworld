

## Plan: Hourly Play Pricing → Guardian Fee + Child Fee

বর্তমানে প্রাইসিং মডেল হলো: base entry_price (1 child+1 guardian) + extra_guardian_price + extra_child_price। এটি পরিবর্তন করে সরাসরি **per-guardian fee** ও **per-child fee** মডেলে আনা হবে।

### পরিবর্তন

#### 1. `src/hooks/useSettings.ts`
- `PricingSettings.hourlyPlay` ইন্টারফেস পরিবর্তন:
  ```tsx
  hourlyPlay: {
    guardianFee: number;  // was childGuardian
    childFee: number;     // was childOnly
    socksFee: number;     // keep socks here too
  }
  ```
- ডিফল্ট ভ্যালু আপডেট
- `loadSettings` — `pricing_hourly` কী থেকে `guardian_fee`, `child_fee`, `socks_fee` পড়া
- `savePricing` — নতুন ফিল্ড সেভ করা

#### 2. `src/pages/admin/AdminSettings.tsx` — Pricing ট্যাব
- "Hourly Play Pricing" কার্ডে ৩টি ফিল্ড: **Fee for Guardian** (৳), **Fee for Child** (৳), **Socks Fee** (৳)
- "Child + Guardian", "Child Only", "Group Discount" ফিল্ড রিমুভ

#### 3. `src/components/admin/ticketing/CounterTicketForm.tsx`
- `ticket_pricing` সেটিং থেকে পড়ার পরিবর্তে `pricing_hourly` সেটিং ব্যবহার করা, অথবা উভয় জায়গা একই key ব্যবহার করা
- `calculatePrices` লজিক:
  ```
  entryPrice = (guardianCount × guardianFee) + (childCount × childFee)
  ```

#### 4. `supabase/functions/create-manual-ticket/index.ts`
- একই প্রাইসিং লজিক: `guardian_fee × guardian_count + child_fee × child_count`
- `pricing_hourly` সেটিং key থেকে ডাটা পড়া (অথবা `ticket_pricing` key-তে নতুন ফরম্যাটে সেভ)

#### 5. `src/components/PricingSection.tsx` — পাবলিক পেজ
- "Family Package" কার্ড আপডেট করে Guardian Fee ও Child Fee দেখানো

### সিদ্ধান্ত
- একটি একক সেটিংস key (`pricing_hourly`) ব্যবহার করা হবে যেখানে `guardian_fee`, `child_fee`, `socks_fee` থাকবে
- পুরানো `ticket_pricing` key ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য ফলব্যাক হিসেবে থাকবে

| ফাইল | পরিবর্তন |
|---|---|
| `src/hooks/useSettings.ts` | ইন্টারফেস ও লজিক আপডেট |
| `src/pages/admin/AdminSettings.tsx` | Guardian Fee, Child Fee, Socks Fee ফিল্ড |
| `src/components/admin/ticketing/CounterTicketForm.tsx` | নতুন প্রাইসিং ক্যালকুলেশন |
| `supabase/functions/create-manual-ticket/index.ts` | এজ ফাংশনে নতুন প্রাইসিং লজিক |
| `src/components/PricingSection.tsx` | পাবলিক প্রাইসিং কার্ড আপডেট |

