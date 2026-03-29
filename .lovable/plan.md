

## রাইড টেবিলে Duration কলাম যোগ

### পরিবর্তন: `src/pages/admin/AdminRides.tsx`

**ডেস্কটপ টেবিল (line ~448):**
- "Offer Price" ও "Status" এর মধ্যে নতুন `<TableHead>Duration</TableHead>` যোগ
- টেবিল বডিতে (line ~472 এর পরে) নতুন `<TableCell>` যোগ: `{ride.duration_minutes ? `${ride.duration_minutes} min` : '—'}`

**মোবাইল কার্ড ভিউ (line ~398-430):**
- প্রাইসের পাশে duration দেখানো: `{ride.duration_minutes}min`

মোট ৩-৪ লাইন যোগ, ১টি ফাইলে।

