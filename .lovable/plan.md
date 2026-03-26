

## Plan: Ticket List UI/UX অডিট ও কমপ্যাক্ট করা

### পরিবর্তন — `src/pages/admin/AdminTicketing.tsx`

#### 1. Stats Cards কমপ্যাক্ট
- `CardHeader` এর প্যাডিং কমানো (`p-3` ব্যবহার)
- `CardTitle` ফন্ট সাইজ `text-xl` করা
- `CardDescription` এর সাথে আইকন যোগ করে ভিজ্যুয়াল আইডেন্টিটি দেওয়া

#### 2. টেবিল কমপ্যাক্ট
- টেবিলের `TableCell` প্যাডিং কমানো (`py-2 px-3`)
- ফন্ট সাইজ ছোট করা (`text-sm` / `text-xs`)
- Actions কলামে বাটন আরো ছোট করা (`size="icon"` + `h-7 w-7`)
- Entry/Exit বাটনে শুধু আইকন, টেক্সট বাদ

#### 3. ফিল্টার বার কমপ্যাক্ট
- ফিল্টার row-তে `gap-2` ব্যবহার
- ইনপুট হাইট কমানো (`h-9`)

#### 4. UX ফিক্স
- Customer Summary কার্ডের প্যাডিং কমানো (`p-3`)
- "Ticket List" হেডারে ডুপ্লিকেট টাইটেল আছে (পেজ হেডার + কার্ড হেডার) — কার্ড হেডার থেকে "Ticket List" সরিয়ে শুধু ফিল্টার রাখা
- Pagination footer কমপ্যাক্ট
- Location ও Status কলাম মার্জ করে একটি কলামে দেখানো — কলাম সংখ্যা কমবে
- Price কলামে socks_price ও addons_price ও দেখানো (tooltip বা inline)

| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminTicketing.tsx` | সম্পূর্ণ UI কমপ্যাক্ট ও UX ফিক্স |

