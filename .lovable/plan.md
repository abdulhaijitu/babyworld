

## পরিকল্পনা: Event Packages পেজ — কার্ড ভিউ সরিয়ে শুধু টেবিল রাখা

### সমস্যা
বর্তমানে একই ডেটা দুবার দেখাচ্ছে — উপরে কার্ড গ্রিড (Active packages) এবং নিচে টেবিল (All Packages)।

### পরিবর্তন (`src/pages/admin/AdminEventPackages.tsx`)

1. **কার্ড গ্রিড সরানো** — লাইন 221-254 এর পুরো `grid` ব্লক মুছে ফেলা
2. **টেবিলে Features কলাম যোগ** — প্রতিটি ফিচার ছোট Badge হিসেবে দেখাবে
3. **টেবিল ডিজাইন উন্নত করা**:
   - Image থাম্বনেইল আরও সুন্দর (rounded-lg, shadow)
   - Price বোল্ড ও প্রাইমারি কালার
   - Active/Inactive স্ট্যাটাস Switch সহ Badge
   - Features কলামে ছোট pill-style badges

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminEventPackages.tsx` | কার্ড গ্রিড (লাইন 221-254) সরানো, টেবিলে Features কলাম যোগ ও ডিজাইন উন্নত |

