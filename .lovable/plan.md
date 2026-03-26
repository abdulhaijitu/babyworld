

## Plan: Membership Packages পেজ — টেবিল ভিউ ডিজাইন

রেফারেন্স ইমেজের মতো কার্ড লেআউট থেকে **টেবিল লেআউট**-এ রূপান্তর করা হবে।

### পরিবর্তন — `src/pages/admin/AdminMembershipPackages.tsx`

বর্তমান কার্ড-গ্রিড লেআউট সম্পূর্ণ বদলে টেবিল-ভিত্তিক ডিজাইন:

1. **হেডার সেকশন**: টাইটেল + সার্চ ইনপুট + "+ Create Package" বাটন
2. **ডাটা টেবিল** কলামসমূহ:
   - SL (serial number)
   - Package Name
   - Validity (duration_days → "X Days" ফরম্যাট)
   - Allowed Person (Guardian + Kids সংখ্যা — max_children থেকে)
   - Price (৳ ফরম্যাট)
   - Discount
   - Status (Active/Inactive ব্যাজ — সবুজ/ধূসর)
   - Action (Select ড্রপডাউন → Edit / Activate-Deactivate)

3. **ইনলাইন এডিটিং** — Action ড্রপডাউনে Edit ক্লিক করলে Dialog/Sheet-এ ফর্ম ওপেন হবে (টেবিল ক্লিন থাকবে)
4. **সার্চ ফিল্টার** — নাম দিয়ে ক্লায়েন্ট-সাইড ফিল্টার
5. **DB স্কিমায় `max_guardians` কলাম নেই** — তাই Allowed Person-এ Guardian সংখ্যা হিসেবে 2 ডিফল্ট দেখাবো, অথবা features JSON থেকে পড়বো। পরে আলাদা কলাম যোগ করা যাবে।

### টেকনিক্যাল ডিটেইলস

| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminMembershipPackages.tsx` | সম্পূর্ণ রি-রাইট — Table কম্পোনেন্ট ব্যবহার, সার্চ, ড্রপডাউন অ্যাকশন, এডিট ডায়ালগ |

- `Table, TableHeader, TableBody, TableRow, TableHead, TableCell` থেকে ইম্পোর্ট
- `DropdownMenu` ব্যবহার Action কলামে
- `Dialog` ব্যবহার এডিট ফর্মের জন্য
- স্ট্যাটাস ব্যাজ: Active → সবুজ, Inactive → ধূসর

