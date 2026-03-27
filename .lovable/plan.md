

## Plan: Expense Categories সাবমেনু ও ম্যানেজমেন্ট পেজ যোগ করা

### কী করা হবে
Accounts গ্রুপে Expenses-এর পরে **Expense Categories** নামে একটি নতুন সাবমেনু যোগ হবে, যেখানে অ্যাডমিন খরচের ক্যাটেগরি (Rent, Staff Salary, Utilities ইত্যাদি) ম্যানেজ করতে পারবে — যোগ, সম্পাদনা ও মুছে ফেলা।

### পরিবর্তন

| ফাইল | কাজ |
|------|------|
| **Migration** | `expense_categories` টেবিল তৈরি — `id`, `name`, `label`, `icon`, `color`, `is_active`, `created_at` |
| `AdminSidebar.tsx` | Accounts children-এ `{ id: 'expense-categories', label: 'Expense Categories', icon: Tags, path: '/admin/expense-categories' }` যোগ |
| `AdminExpenseCategories.tsx` (নতুন) | CRUD পেজ — ক্যাটেগরি তালিকা, যোগ/সম্পাদনা ডায়ালগ, ডিলিট |
| `App.tsx` | `/admin/expense-categories` রাউট যোগ |
| `AdminExpenses.tsx` | হার্ডকোডেড `EXPENSE_CATEGORIES` অ্যারের বদলে DB থেকে ক্যাটেগরি ফেচ করা |
| `AdminProfitReports.tsx` | `EXPENSE_CATEGORY_LABELS` DB থেকে ফেচ করা |

### DB টেবিল স্কিমা
```sql
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,        -- 'rent', 'staff_salary'
  label TEXT NOT NULL,               -- 'Rent', 'Staff Salary'
  icon TEXT DEFAULT 'receipt',       -- lucide icon name
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Seed with existing 8 categories
-- RLS: super_admin/admin/manager can CRUD
```

### ক্যাটেগরি ম্যানেজমেন্ট পেজ ফিচার
- ক্যাটেগরি তালিকা (নাম, আইকন, কালার, স্ট্যাটাস)
- যোগ/সম্পাদনা ডায়ালগ ফর্ম
- Active/Inactive টগল
- ডিলিট (যদি কোনো expense এই ক্যাটেগরিতে না থাকে)

