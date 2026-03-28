

## ফিক্স: ফিল্টার সেকশন ১ রো-তে কমপ্যাক্ট

স্ক্রিনশটে দেখা যাচ্ছে সার্চ বক্স আলাদা রো-তে, তারপর ফিল্টার আরেক রো-তে। এগুলো সব একটি রো-তে আনতে হবে।

### পরিবর্তন — `src/pages/admin/AdminTicketing.tsx` (লাইন 443-516)

- `flex flex-col gap-2` বদলে `flex flex-wrap items-center gap-2` করা — সব এলিমেন্ট এক রো-তে
- সার্চ ইনপুটের `w-full` সরিয়ে `flex-1 min-w-[140px]` দেওয়া — বাকি জায়গা নেবে, ছোট স্ক্রিনে wrap হবে
- All সিলেক্ট `w-[80px]`, From/To বাটন `min-w-[70px]` — আরও কমপ্যাক্ট
- Count badge + Refresh `ml-auto` দিয়ে ডানে

```text
মোবাইল (পরে):
[🔍 Search...] [All▾] [From] [To] [x] [44] [⟳]
```

### ফাইল
- `src/pages/admin/AdminTicketing.tsx`

