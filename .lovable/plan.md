

## Plan: সাইডবার লেবেল পরিবর্তন ও কার্ড কমপ্যাক্ট ডিজাইন

### পরিবর্তন ১ — `src/components/admin/AdminSidebar.tsx`
- Line 55: `label: 'Memberships'` → `label: 'All Members'`

### পরিবর্তন ২ — `src/pages/admin/AdminMemberships.tsx`

**Stats কার্ড (lines 383-403) ও Payment Summary কার্ড (lines 405-432) একত্রিত করে একটি কমপ্যাক্ট সিঙ্গেল-রো ডিজাইন:**

- Stats (Total, Active, Expired) এবং Payment Summary (Total Collected, Cash, Online, Pending) — সব একটি 7-কলাম গ্রিডে (মোবাইলে 2-কলাম, md-তে 4, lg-তে 7)
- প্রতিটি আইটেম ছোট কার্ড: `p-2` প্যাডিং, `text-lg` ফন্ট (বর্তমান `text-3xl`/`text-xl` থেকে ছোট)
- Payment Summary-র আলাদা কার্ড হেডার রিমুভ — সব ইনলাইন
- এতে টেবিলের জন্য অনেক বেশি জায়গা পাওয়া যাবে

### টেকনিক্যাল ডিটেইলস
- দুটি ফাইলে সামান্য পরিবর্তন, কোনো নতুন কম্পোনেন্ট বা DB চেঞ্জ নেই

