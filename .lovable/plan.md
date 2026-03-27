

## Plan: HUMAN RESOURCES মেনু গ্রুপ তৈরি

MARKETING মেনুর নিচে একটি নতুন **HUMAN RESOURCES** গ্রুপ তৈরি হবে যেখানে ৬টি সাবমেনু থাকবে। এর মধ্যে Employees ও Roster বিদ্যমান পেজগুলো এই গ্রুপে সরানো হবে, এবং ৪টি নতুন পেজ তৈরি হবে।

### সাবমেনু তালিকা
1. **Employees** (বিদ্যমান — শুধু গ্রুপে সরানো)
2. **Roster** (বিদ্যমান — শুধু গ্রুপে সরানো)
3. **Attendance** (নতুন) — দৈনিক উপস্থিতি ট্র্যাকিং, চেক-ইন/আউট
4. **Payroll** (নতুন) — বেতন হিসাব, স্লিপ ও পেমেন্ট ট্র্যাকিং
5. **Leave Management** (নতুন) — ছুটির আবেদন, অনুমোদন ও ব্যালেন্স
6. **Performance** (নতুন) — কর্মচারী রিভিউ ও রেটিং

### ধাপসমূহ

**Step 1: Database — ৩টি নতুন টেবিল তৈরি**
- `attendance` — employee_id, date, check_in, check_out, status (present/absent/late/half_day)
- `employee_leaves` — employee_id, leave_type (sick/casual/annual), start_date, end_date, status (pending/approved/rejected), reason
- `employee_payroll` — employee_id, month, year, basic_salary, deductions, bonuses, net_salary, status (draft/paid), paid_at
- `employee_performance` — employee_id, review_period, rating (1-5), reviewer_notes, reviewed_by, reviewed_at
- সবগুলোতে RLS: admin/manager = full access

**Step 2: Sidebar আপডেট (`AdminSidebar.tsx`)**
- Employees ও Roster কে স্বতন্ত্র আইটেম থেকে সরিয়ে নতুন `hr` গ্রুপ তৈরি
- MARKETING এর পরে HUMAN RESOURCES গ্রুপ বসবে
- সাবমেনু: Employees, Roster, Attendance, Leave, Payroll, Performance

**Step 3: ৪টি নতুন পেজ ও হুক তৈরি**
- `src/pages/admin/AdminAttendance.tsx` + `src/hooks/useAttendance.ts`
- `src/pages/admin/AdminLeaveManagement.tsx` + `src/hooks/useEmployeeLeaves.ts`
- `src/pages/admin/AdminPayroll.tsx` + `src/hooks/usePayroll.ts`
- `src/pages/admin/AdminPerformance.tsx` + `src/hooks/usePerformance.ts`

**Step 4: App.tsx রাউট যোগ**
- `/admin/attendance`, `/admin/leaves`, `/admin/payroll`, `/admin/performance`

### প্রতিটি পেজের মূল ফিচার

| পেজ | ফিচার |
|------|--------|
| Attendance | তারিখ ভিত্তিক চেক-ইন/আউট, দৈনিক সামারি, কর্মচারী ড্রপডাউন |
| Leave | ছুটির আবেদন ফর্ম, অনুমোদন/প্রত্যাখ্যান, ব্যালেন্স দেখা |
| Payroll | মাসিক বেতন এন্ট্রি, ডিডাকশন/বোনাস, পেমেন্ট স্ট্যাটাস |
| Performance | রিভিউ পিরিয়ড, ১-৫ রেটিং, নোটস, রিভিউয়ার ট্র্যাকিং |

