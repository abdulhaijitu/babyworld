

## Plan: Create Package মোডাল সংশোধন ও Edit Package হুবহু ডিজাইন

### পরিবর্তন — `src/pages/admin/AdminMembershipPackages.tsx`

#### 1. Create Dialog থেকে ৩টি ফিল্ড সরানো
- **Name (Bangla)** ফিল্ড (lines 446-453) — সম্পূর্ণ রিমুভ
- **Package Type** সিলেক্ট (lines 454-465) — সম্পূর্ণ রিমুভ
- **Discount %** ফিল্ড (lines 549-557) — সম্পূর্ণ রিমুভ

`createForm` state থেকে `name_bn`, `membership_type`, `discount_percent` রিমুভ। `createMutation`-এ `name_bn: null`, `membership_type: 'monthly'` (ডিফল্ট), `discount_percent: 100` (ডিফল্ট) সেট করা হবে।

Create Dialog-এ Name (Bangla)/Package Type সরানোর পর Validity ফিল্ড Price-এর পাশে উঠে আসবে (2-কলাম গ্রিড ঠিক থাকবে)।

#### 2. Edit Dialog-কে Create Dialog-এর হুবহু ডিজাইনে আপডেট
Edit Dialog-এ নিচের ফিল্ডগুলো যোগ হবে (Create-এর মতো):
- **Duration** (Minutes ব্যাজসহ)
- **Entrance Method** সিলেক্ট
- **Allowed Visit** (Times ব্যাজসহ)
- **Package Benefits** সেকশন (Benefit Title + Description)

Edit Dialog থেকেও **Name (Bangla)**, **Discount %** সরানো হবে।

`editForm` state-এ features JSON থেকে `duration_minutes`, `entrance_method`, `allowed_visits`, `benefit_title`, `benefit_description` লোড হবে। `saveEdit`-এ features JSON-এ সেভ হবে।

### টেকনিক্যাল ডিটেইলস
- `startEdit` ফাংশনে `pkg.features` থেকে এক্সট্রা ফিল্ড এক্সট্র্যাক্ট করে `editForm`-এ সেট
- `saveEdit`-এ features JSON তৈরি করে আপডেট কলে পাঠানো
- উভয় ডায়ালগে একই ফিল্ড অর্ডার: Name → Price → Validity → Duration → Guardian → Kids → Entrance Method → Allowed Visit → Active → Benefits

