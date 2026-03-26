

## Plan: + New Member মোডাল অডিট ও ফিক্স

### সমস্যাগুলো চিহ্নিত

1. **Discount (%) ফিল্ড এখনও আছে** (line 270-278) — আগের প্ল্যানে সরানোর কথা ছিল, সরানো হয়নি
2. **Package সিলেক্ট বাগ**: `membership_type` দিয়ে ম্যাচ করা হচ্ছে — একই টাইপের একাধিক প্যাকেজ থাকলে ভুল প্যাকেজ সিলেক্ট হবে। Package ID দিয়ে সিলেক্ট করা উচিত
3. **Guardian count ফিল্ড নেই** — প্যাকেজে max_guardians আছে কিন্তু ফর্মে guardian count ইনপুট নেই
4. **ফোন নম্বর ভ্যালিডেশন নেই** — ক্লায়েন্ট সাইডে কোনো ফরম্যাট চেক নেই
5. **Valid From ডেট পিকার নেই** — Edge function-এ `valid_from` সাপোর্ট আছে কিন্তু UI-তে নেই
6. **Plan সিলেক্ট করলে price info বার বার `packages.find()` করছে** — অদক্ষ

### পরিবর্তন — `src/pages/admin/AdminMemberships.tsx`

#### ফর্ম স্টেট আপডেট
- `formData`-তে `selected_package_id`, `guardian_count`, `valid_from` যোগ
- `discount_percent` রিমুভ (ডিফল্ট 100 edge function-এ পাঠানো হবে)

#### UI পরিবর্তন
- **Discount (%) ফিল্ড রিমুভ** — Child Count ফুল-উইথ হবে
- **Plan সিলেক্ট**: Package ID দিয়ে সিলেক্ট, প্যাকেজ নাম + price দেখাবে। সিলেক্ট করলে child_count, guardian_count, payment_amount অটো-ফিল হবে
- **Guardian Count ফিল্ড যোগ** — Child Count-এর পাশে 2-কলাম গ্রিডে
- **Valid From ডেট ইনপুট যোগ** — ডিফল্ট আজকের তারিখ
- **ফোন ভ্যালিডেশন** — বাংলাদেশি ফরম্যাট চেক (01XXXXXXXXX), ভুল হলে এরর মেসেজ
- Package info সামারি — সিলেক্টেড প্যাকেজের Duration, Max Guardian, Max Kids একবারে দেখাবে

#### handleCreate আপডেট
- সিলেক্টেড প্যাকেজ থেকে `membership_type` নিয়ে edge function-এ পাঠাবে
- `valid_from` পাঠাবে
- ফোন ভ্যালিডেশন চেক

### টেকনিক্যাল ডিটেইলস
- শুধু একটি ফাইল পরিবর্তন: `AdminMemberships.tsx`
- DB বা Edge Function চেঞ্জ নেই — edge function ইতোমধ্যে `valid_from` সাপোর্ট করে

