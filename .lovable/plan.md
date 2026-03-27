

## পরিকল্পনা: Role & Permission মেনু ও রোল ম্যানেজমেন্ট সিস্টেম

### ১. সাইডবার আপডেট (`AdminSidebar.tsx`)

বর্তমান standalone `users` আইটেম (লাইন 83) সরিয়ে Frontend-এর পরে নতুন গ্রুপ যোগ:

```
Role & Permission (icon: Shield, requiredRoles: ['super_admin'])
  ├── Users         → /admin/users
  └── Roles         → /admin/roles (নতুন পেজ)
```

### ২. রোল ম্যানেজমেন্ট পেজ তৈরি

**নতুন ফাইল:** `src/pages/admin/AdminRoles.tsx`

এই পেজে সব রোল দেখাবে এবং প্রতিটি রোলের জন্য পারমিশন কনফিগার করা যাবে।

**প্রস্তাবিত রোলসমূহ:**

| রোল | বর্ণনা |
|------|---------|
| Management | সব মডিউলে ফুল অ্যাক্সেস (ডিলিট ছাড়া) |
| Manager | HR, Accounts, Reports, Marketing অ্যাক্সেস |
| Sales & Marketing | Leads, Promotions, SMS Campaigns, Social Media |
| Ticket Counterman | টিকেট তৈরি, টিকেট লিস্ট, গেট লগ |
| Gateman | গেট লগ এন্ট্রি, টিকেট স্ক্যান |
| Food Manager | Food POS, Orders, Items, Coupons ম্যানেজমেন্ট |
| Food Staff | Food POS ও Orders (আইটেম এডিট নয়) |
| **Booking Manager** | ইভেন্ট বুকিং, ইভেন্ট ক্যালেন্ডার, প্যাকেজ |
| **Accountant** | Income, Expenses, Daily Cash, Profit Reports |
| **HR Manager** | Employees, Attendance, Payroll, Leave, Roster |

> শেষ ৩টি (Booking Manager, Accountant, HR Manager) আমার সাজেশন — কারণ এগুলো আলাদা ডিপার্টমেন্টের জন্য প্রয়োজন হতে পারে।

### ৩. ডাটাবেস পরিবর্তন

**নতুন enum আপডেট:** বর্তমান `app_role` enum-এ নতুন ভ্যালু যোগ:
```sql
ALTER TYPE app_role ADD VALUE 'management';
ALTER TYPE app_role ADD VALUE 'sales_marketing';
ALTER TYPE app_role ADD VALUE 'ticket_counterman';
ALTER TYPE app_role ADD VALUE 'gateman';
ALTER TYPE app_role ADD VALUE 'food_manager';
ALTER TYPE app_role ADD VALUE 'food_staff';
```

**নতুন টেবিল:** `role_permissions` — প্রতিটি রোলের জন্য কোন মডিউলে অ্যাক্সেস আছে তা সংরক্ষণ:
```sql
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module text NOT NULL,        -- e.g. 'ticketing', 'foods', 'hr'
  can_view boolean DEFAULT true,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  UNIQUE(role, module)
);
```

### ৪. রোল ম্যানেজমেন্ট UI

`AdminRoles.tsx` পেজে:
- সব রোলের কার্ড/টেবিল ভিউ (রোল নাম, বর্ণনা, অ্যাসাইনড ইউজার সংখ্যা)
- রোলে ক্লিক করলে পারমিশন ম্যাট্রিক্স দেখাবে (মডিউল × View/Create/Edit/Delete চেকবক্স)
- Super Admin দেখাবে না (হিডেন থাকবে, কিন্তু সব অ্যাক্সেস পাবে)

### ৫. রাউটিং আপডেট (`App.tsx`)

```
<Route path="roles" element={<AdminRoles />} />
```

### ৬. `useUserRoles.ts` আপডেট

নতুন রোলগুলোর জন্য `AppRole` টাইপ আপডেট এবং পারমিশন চেকিং লজিক যোগ।

### টেকনিক্যাল নোট
- `super_admin` সবসময় হিডেন থাকবে এবং `has_role` / `has_any_role` ফাংশনে ইমপ্লিসিটলি সব পারমিশন পাবে
- সাইডবার মেনু আইটেমগুলোর `requiredRoles` পরবর্তীতে `role_permissions` টেবিল থেকে ডাইনামিক্যালি লোড করা যাবে
- প্রথম ফেজে স্ট্যাটিক রোল ডেফিনিশন থাকবে, পরে ডাইনামিক পারমিশন ম্যাট্রিক্স যোগ করা যাবে

