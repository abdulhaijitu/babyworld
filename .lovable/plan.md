

## Plan: Create Package মোডাল রিডিজাইন

রেফারেন্স ইমেজ অনুযায়ী Create Package ডায়ালগকে সেকশন-ভিত্তিক, পরিষ্কার লেআউটে রূপান্তর।

### পরিবর্তন — `src/pages/admin/AdminMembershipPackages.tsx`

**Create Dialog (lines 348-444) সম্পূর্ণ রিডিজাইন:**

1. **ডায়ালগ সাইজ বড়**: `max-w-2xl` করা হবে, `max-h-[85vh] overflow-y-auto` স্ক্রলযোগ্য
2. **সেকশন হেডার** — রেফারেন্সের মতো রঙিন সেকশন টাইটেল:
   - **PACKAGE INFORMATION** (প্রাইমারি কালার হেডিং + ডিভাইডার)
   - **PACKAGE BENEFITS** (প্রাইমারি কালার হেডিং + ডিভাইডার)
3. **ফিল্ড লেআউট** — 2-কলাম গ্রিড:
   - Row 1: Package Name | Price (৳ BDT ব্যাজসহ)
   - Row 2: Validity (Days ব্যাজসহ) | Duration (Minutes ব্যাজসহ)
   - Row 3: Allowed Person (Guardian) Select | Allowed Person (Kids) Select
   - Row 4: Entrance Method | Allowed Visit (Times ব্যাজসহ)
4. **ইনপুট ব্যাজ/সাফিক্স**: Price → "BDT", Validity → "Days", Duration → "Minutes", Visit → "Times" — ইনপুটের ডানে ব্যাজ
5. **Package Benefits সেকশন**: Benefit Title ইনপুট + Description টেক্সটেরিয়া
6. **ফুটার বাটন**: "Discard" (আউটলাইন, ফুল-উইডথ) | "Save Package" (প্রাইমারি, ফুল-উইডথ)

### নতুন ফিল্ড (DB ছাড়া, features JSON-এ সেভ):
- `duration_minutes`, `entrance_method`, `allowed_visits`, `benefit_title`, `benefit_description` — সবই `features` JSON কলামে সংরক্ষণ

### টেকনিক্যাল ডিটেইলস
- `createForm` state-এ নতুন ফিল্ড যোগ
- `createMutation`-এ features JSON-এ এক্সট্রা ডাটা ইনসার্ট
- `Separator` কম্পোনেন্ট ব্যবহার সেকশন ডিভাইডারে
- `Textarea` কম্পোনেন্ট ইম্পোর্ট Description-এর জন্য
- Select কম্পোনেন্ট Guardian/Kids ড্রপডাউনে

