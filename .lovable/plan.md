

## Plan: ACCOUNTS সাইডবার গ্রুপ যোগ করা

### পরিবর্তন
HR মেনুর পরে একটি নতুন **Accounts** গ্রুপ তৈরি হবে। বর্তমানে Expenses ও Profit & Loss আলাদা আইটেম হিসেবে আছে — এগুলো Accounts গ্রুপের সাবমেনুতে চলে যাবে।

### প্রস্তাবিত সাবমেনু
| সাবমেনু | আইকন | পাথ | বিবরণ |
|---------|-------|-----|-------|
| Expenses | Receipt | /admin/expenses | বিদ্যমান — খরচ ট্র্যাকিং |
| Profit & Loss | TrendingUp | /admin/profit | বিদ্যমান — লাভ-লোকসান রিপোর্ট |
| Reports | FileBarChart | /admin/reports | বিদ্যমান — রেভিনিউ, টিকেট, ফুড সেলস রিপোর্ট |

### আরও যা যোগ করা যেতে পারে (ভবিষ্যতে)
- **Daily Cash Summary** — দৈনিক ক্যাশ কালেকশনের হিসাব (টিকেট + ফুড + মেম্বারশিপ)
- **Bank Transactions** — ব্যাংক ডিপোজিট ও উইথড্রয়ালের রেকর্ড
- **Invoice Management** — ভেন্ডর/সাপ্লায়ারদের ইনভয়েস ট্র্যাকিং
- **Tax Reports** — ভ্যাট/ট্যাক্স সংক্রান্ত রিপোর্ট

### কোড পরিবর্তন (`AdminSidebar.tsx`)
- `allMenuItems` অ্যারেতে HR-এর পরে নতুন `accounts` গ্রুপ যোগ হবে, `Wallet` আইকন সহ
- Expenses, Profit & Loss, এবং Reports — এই তিনটি বিদ্যমান আলাদা আইটেম সরিয়ে Accounts গ্রুপের children-এ নেওয়া হবে
- রোল অ্যাক্সেস: `['super_admin', 'admin', 'manager']`
- কোনো নতুন পেজ বা রাউট তৈরি করতে হবে না — শুধু মেনু reorganization

