

## পরিকল্পনা: Dashboard রিডিজাইন — প্রোজেক্ট-ভিত্তিক Overview

### বর্তমান সমস্যা

1. **Revenue ভুল হিসাব** — হার্ডকোডেড `PRICE_PER_TICKET = 300` দিয়ে শুধু bookings থেকে revenue ক্যালকুলেট হচ্ছে। আসল টিকেট, ফুড অর্ডার, এক্সপেন্স কোনোটাই ধরা হচ্ছে না।
2. **Bookings টেবিল ডুপ্লিকেশন** — ড্যাশবোর্ডে পুরো বুকিং টেবিল (ফিল্টার, সার্চ, ক্যান্সেল ডায়ালগসহ) আছে যা `/admin/bookings` পেজের কাজ। ড্যাশবোর্ড হওয়া উচিত quick overview।
3. **মূল ডেটা সোর্স অনুপস্থিত** — টিকেট সেলস, ফুড রেভিনিউ, মেম্বারশিপ, এক্সপেন্স — এগুলো ড্যাশবোর্ডে নেই।
4. **QuickReportsWidget** ইতিমধ্যে `get-reports-summary` edge function ব্যবহার করে আসল ডেটা আনে, কিন্তু revenue cards সেটা ব্যবহার করে না।

### প্রস্তাবিত ড্যাশবোর্ড লেআউট

```text
┌──────────────────────────────────────────────────┐
│  Dashboard                                        │
├──────────────────────────────────────────────────┤
│  [Expiring Cards Alert — যদি থাকে]               │
├──────────────────────────────────────────────────┤
│  Revenue Summary Cards (from get-reports-summary) │
│  ┌─────────┬──────────┬──────────┬──────────┐    │
│  │Today's  │ Ticket   │ Food     │ Total    │    │
│  │Revenue  │ Sales    │ Revenue  │ Expenses │    │
│  │ (real)  │ (count)  │ (amount) │ (today)  │    │
│  └─────────┴──────────┴──────────┴──────────┘    │
├──────────────────────────────────────────────────┤
│  ┌───────────┬───────────┬───────────────────┐   │
│  │ Quick     │ Visitor   │ Activity Log      │   │
│  │ Actions   │ Counter   │ (2 col wide)      │   │
│  │           │ (live)    │                   │   │
│  └───────────┴───────────┴───────────────────┘   │
├──────────────────────────────────────────────────┤
│  ┌────────────────────┬─────────────────────┐    │
│  │ Today's Tickets    │ Recent Food Orders  │    │
│  │ (compact list,     │ (compact list,      │    │
│  │  last 5, link to   │  last 5, link to    │    │
│  │  /admin/ticketing)  │  /admin/food-orders)│    │
│  └────────────────────┴─────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### পরিবর্তন তালিকা

| ফাইল | কাজ |
|------|------|
| `AdminDashboardContent.tsx` | সম্পূর্ণ রিফ্যাক্টর — হার্ডকোডেড revenue সরানো, `useReportsSummary('today')` থেকে আসল ডেটা ব্যবহার, বুকিং টেবিল বাদ দিয়ে compact Today's Tickets ও Recent Food Orders উইজেট যোগ |
| `QuickReportsWidget.tsx` | বাদ — এর ডেটা সরাসরি ড্যাশবোর্ডের revenue cards-এ মার্জ হবে |

### কী বদলাচ্ছে

1. **Revenue Cards** — `useReportsSummary('today')` hook ব্যবহার করে আসল ডেটা দেখাবে (টিকেট রেভিনিউ, ফুড রেভিনিউ, combined revenue)
2. **Bookings টেবিল বাদ** — পুরো ফিল্টারযুক্ত বুকিং টেবিল, ক্যান্সেল ডায়ালগ, সব সরে যাবে। এগুলো `/admin/bookings`-এ আছে
3. **Today's Tickets** — আজকের শেষ ৫টি টিকেট compact list-এ দেখাবে, "View All" বাটন `/admin/ticketing`-এ নিয়ে যাবে
4. **Recent Food Orders** — আজকের শেষ ৫টি ফুড অর্ডার compact list-এ, "View All" বাটন `/admin/food-orders`-এ
5. **Quick Actions + Visitor Counter + Activity Log** — এগুলো বজায় থাকবে

### কারিগরি বিবরণ

- কোনো নতুন টেবিল বা migration লাগবে না
- `useReportsSummary` hook ইতিমধ্যে আছে এবং edge function থেকে আসল revenue ডেটা আনে
- `QuickReportsWidget` কম্পোনেন্ট মুছে ফেলা হবে কারণ এর ডেটা মূল revenue cards-এ চলে আসবে
- ফাইল সাইজ উল্লেখযোগ্যভাবে কমবে (বর্তমান ~550 লাইন → ~200 লাইন)

