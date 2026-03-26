

## Plan: Entry No ইউনিক + ফোন নাম্বার দিয়ে তথ্য সিঙ্ক

### পরিবর্তন ১: Entry No ইউনিক করা

বর্তমানে `useMemo` দিয়ে `YYMMDD-XXX` ফরম্যাটে random generate হয় — collision হতে পারে। পরিবর্তন:
- Component mount-এ DB থেকে আজকের সর্বশেষ ticket number fetch করে sequential number বানাবে
- Format: `YYMMDD-001`, `YYMMDD-002`, ...
- আজকের tickets count query করে next number নির্ধারণ

### পরিবর্তন ২: ফোন নাম্বার দিয়ে তথ্য সিঙ্ক

বর্তমানে শুধু membership check হয়। এখন phone enter করলে:
- `tickets` টেবিল থেকে সর্বশেষ ticket fetch করবে (same phone)
- `guardian_name` ও `notes` (address) auto-fill করবে
- User দেখবে "Previous customer found" badge
- Membership check-ও আগের মতো থাকবে

### ফাইল

| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/admin/ticketing/CounterTicketForm.tsx` | Entry No sequential generate + phone lookup auto-fill |

No DB migration needed.

