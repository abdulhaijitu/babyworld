

## Plan: Income ও Income Categories সাবমেনু যোগ করা

### আর্কিটেকচার

টিকেট, ফুড ও মেম্বারশিপ আয় ইতিমধ্যে অটো-ট্র্যাক হচ্ছে। তাই **Income পেজ দুই ভাগে কাজ করবে**:

1. **Manual Income** — ইনভেস্টমেন্ট, লোন, ডোনেশন, স্পন্সরশিপ, সাময়িক ক্যাশ ইত্যাদি ম্যানুয়ালি এন্ট্রি করা যাবে (CRUD)
2. **Summary View** — অটো আয় (টিকেট, ফুড, মেম্বারশিপ) + ম্যানুয়াল আয় একসাথে একটি সামারি কার্ডে দেখানো হবে

### ডাটাবেস পরিবর্তন

**নতুন টেবিল: `income_categories`**
```sql
CREATE TABLE income_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,       -- 'investment', 'loan', 'donation'
  label TEXT NOT NULL,              -- 'Investment', 'Loan'
  icon TEXT DEFAULT 'banknote',
  color TEXT DEFAULT 'bg-green-100 text-green-800',
  is_system BOOLEAN DEFAULT false,  -- true = auto (ticket, food, membership)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Seed: Ticketing (system), Food Sales (system), Membership (system),
--        Investment, Loan, Donation, Sponsorship, Other
```

**নতুন টেবিল: `incomes`**
```sql
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,           -- income_categories.name
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash',  -- cash, bank, online
  description TEXT NOT NULL,
  notes TEXT,
  added_by UUID,
  added_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

RLS: admin/manager can CRUD, staff can view।

### সাইডবার মেনু (Accounts children)

| ক্রম | সাবমেনু | আইকন | পাথ |
|------|---------|-------|-----|
| 1 | Daily Cash Summary | Briefcase | /admin/daily-cash |
| 2 | **Income** | ArrowDownCircle | /admin/income |
| 3 | **Income Categories** | Tag | /admin/income-categories |
| 4 | Expenses | Receipt | /admin/expenses |
| 5 | Expense Categories | Tag | /admin/expense-categories |
| 6 | Profit & Loss | TrendingUp | /admin/profit |
| 7 | Reports | FileBarChart | /admin/reports |

### নতুন ফাইল

| ফাইল | বিবরণ |
|------|-------|
| `src/pages/admin/AdminIncome.tsx` | Income পেজ — উপরে সামারি কার্ড (অটো + ম্যানুয়াল), নিচে ম্যানুয়াল income তালিকা ও এন্ট্রি ফর্ম |
| `src/pages/admin/AdminIncomeCategories.tsx` | Income Categories CRUD — Expense Categories-এর মতো |
| `src/hooks/useIncomeCategories.ts` | ক্যাটেগরি ফেচ হুক |

### বিদ্যমান ফাইল পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `AdminSidebar.tsx` | Income ও Income Categories সাবমেনু যোগ |
| `App.tsx` | `/admin/income` ও `/admin/income-categories` রাউট যোগ |

### Income পেজ UI ডিজাইন

**সামারি কার্ড (৪টি):**
- Total Income (অটো + ম্যানুয়াল)
- Ticket & Food Revenue (অটো — DB থেকে)
- Membership Revenue (অটো — DB থেকে)
- Other Income (ম্যানুয়াল এন্ট্রি)

**ম্যানুয়াল Income তালিকা:**
- তারিখ ফিল্টার, ক্যাটেগরি ফিল্টার
- Add Income ডায়ালগ (তারিখ, ক্যাটেগরি, পরিমাণ, পেমেন্ট মেথড, বিবরণ)
- Edit/Delete অপশন

