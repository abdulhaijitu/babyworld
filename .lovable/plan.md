

## পরিকল্পনা: Users পেজে সকল রোল ইন্টিগ্রেশন ও অডিট ফিক্স

### সমস্যা চিহ্নিত

1. **`AdminUsers.tsx`** — `UserRole` টাইপে মাত্র ৪টি রোল (`super_admin`, `admin`, `manager`, `staff`), নতুন ১০টি রোল নেই
2. **`AdminUsers.tsx`** — New User ডায়ালগে রোল সিলেক্টে মাত্র ৪টি অপশন
3. **`AdminUsers.tsx`** — Stats কার্ডে মাত্র ৪টি রোলের কাউন্ট
4. **`AdminUsers.tsx`** — ফিল্টার ড্রপডাউনে মাত্র ৪টি রোল
5. **`AdminUsers.tsx`** — `roleConfig` ম্যাপে নতুন রোলগুলোর লেবেল/আইকন/কালার নেই
6. **`create-admin` Edge Function** — `validRoles` অ্যারেতে মাত্র ৪টি রোল, নতুন রোল দিয়ে ইউজার তৈরি করলে reject হবে
7. **Users টেবিলে email দেখায় না** — শুধু user_id দেখায়, email ফেচ হয় না

### পরিবর্তনসমূহ

#### ১. `src/pages/admin/AdminUsers.tsx`

- `UserRole` টাইপ আপডেট — `useUserRoles.ts`-এর `AppRole` টাইপ রিইউজ করা হবে
- `roleConfig` অবজেক্টে সব ১৩টি রোলের label, icon, color যোগ
- Stats সেকশন রিডিজাইন — ৪টি হার্ডকোডেড কার্ডের বদলে ডাইনামিক role count grid (রোলগুলো যেগুলোর user আছে সেগুলো দেখাবে)
- New User ডায়ালগের রোল সিলেক্টে সব রোল যোগ (super_admin শুধু super_admin দেখতে পাবে)
- ফিল্টার ড্রপডাউনে সব রোল যোগ
- টেবিলে `roleConfig`-এর ফলব্যাক যোগ যাতে unknown রোল crash না করে

#### ২. `supabase/functions/create-admin/index.ts`

- `validRoles` অ্যারে আপডেট — সব ১৩টি রোল যোগ
- `CreateUserRequest` ইন্টারফেসে সব রোল টাইপ যোগ

#### ৩. ইউজারের Email দেখানো (অপশনাল উন্নতি)

- বর্তমানে শুধু `user_id` এর প্রথম ৮ ক্যারেক্টার দেখায়
- Edge function-এ user create করার সময় email রিটার্ন করে — কিন্তু লিস্টে auth.users থেকে email আনার সুযোগ নেই (client-side)
- সমাধান: `create-admin` edge function-এ user তৈরির পর user_roles-এ একটি metadata কলাম না থাকায়, বিকল্প হিসেবে user_id দিয়ে টেবিলে দেখানো চালিয়ে যাওয়া হবে (profiles টেবিল পরবর্তীতে যোগ করা যাবে)

### রোলের সম্পূর্ণ তালিকা ও কনফিগ

| রোল | লেবেল | আইকন |
|------|--------|-------|
| super_admin | Super Admin | Crown |
| admin | Admin | Shield |
| management | Management | Building |
| manager | Manager | Briefcase |
| sales_marketing | Sales & Marketing | Megaphone |
| ticket_counterman | Ticket Counterman | Ticket |
| gateman | Gateman | LogIn |
| food_manager | Food Manager | UtensilsCrossed |
| food_staff | Food Staff | UtensilsCrossed |
| booking_manager | Booking Manager | CalendarDays |
| accountant | Accountant | Wallet |
| hr_manager | HR Manager | Briefcase |
| staff | Staff | HardHat |

### ফাইল পরিবর্তন
- `src/pages/admin/AdminUsers.tsx` — রোল কনফিগ, UI, ফিল্টার আপডেট
- `supabase/functions/create-admin/index.ts` — valid roles আপডেট

