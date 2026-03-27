

## পরিকল্পনা: পেইজ টাইটেল টপবারে স্থানান্তর

### বর্তমান অবস্থা
- টপবারে শুধু `NotificationBell` আছে (ডানদিকে), বামদিক খালি
- প্রতিটি অ্যাডমিন পেইজে নিজস্ব `<h1>` টাইটেল আছে কন্টেন্ট এরিয়ায়
- মোবাইলে টপবার `hidden md:flex` — অর্থাৎ মোবাইলে দেখা যায় না

### পরিবর্তন

**`AdminLayout.tsx` — টপবারে ডাইনামিক পেইজ টাইটেল যোগ**

1. `useLocation` ব্যবহার করে বর্তমান route detect করা
2. Route-to-title ম্যাপিং তৈরি (যেমন `/admin` → "Dashboard", `/admin/ticket-list` → "Ticket List", `/admin/food` → "Food Sales" ইত্যাদি)
3. টপবারে বামদিকে টাইটেল দেখানো — ডেস্কটপ ও মোবাইল উভয়তেই
4. মোবাইলে টপবার visible করা (`hidden md:flex` → `flex`) — compact height সহ
5. মোবাইলে hamburger menu icon ও NotificationBell টপবারে রাখা

**সকল অ্যাডমিন পেইজ — `<h1>` টাইটেল সরানো বা লুকানো**

যেহেতু ৪০+ ফাইলে পরিবর্তন অনেক বেশি কাজ এবং অনেক পেইজে টাইটেলের পাশে বাটন/ফিল্টার আছে, তাই:
- প্রতিটি পেইজ থেকে h1 সরানো হবে না — শুধু **AdminLayout টপবারে** route-based টাইটেল যোগ হবে
- Dashboard পেইজ থেকে duplicate টাইটেল সেকশন সরানো হবে (কারণ এটি সবচেয়ে visible)

### টেকনিক্যাল ডিটেইলস

**Route-to-title ম্যাপ:**
```text
/admin            → Dashboard
/admin/create-ticket → Create Ticket
/admin/ticket-list   → Ticket List
/admin/gate-logs     → Gate Logs
/admin/food          → Food Sales
/admin/food-orders   → Food Orders
/admin/food-pos      → Food POS
/admin/coupons       → Coupons
/admin/employees     → Employees
/admin/roster        → Roster
/admin/attendance    → Attendance
/admin/leaves        → Leave Management
/admin/payroll       → Payroll
/admin/performance   → Performance
/admin/bookings      → Bookings
/admin/events        → Events
/admin/event-packages → Event Packages
/admin/event-calendar → Event Calendar
/admin/leads         → Leads
/admin/promotions    → Promotions
/admin/sms-campaigns → SMS Campaigns
/admin/social-media  → Social Media
/admin/reports       → Reports
/admin/profit        → Profit Reports
/admin/expenses      → Expenses
/admin/expense-categories → Expense Categories
/admin/income        → Income
/admin/income-categories  → Income Categories
/admin/daily-cash    → Daily Cash Summary
/admin/rides         → Rides
/admin/notifications → Notifications
/admin/homepage      → Homepage
/admin/about-contact → About & Contact
/admin/seo-branding  → SEO & Branding
/admin/memberships   → Memberships
/admin/membership-packages → Membership Packages
/admin/member-entry  → Member Entry
/admin/users         → Users
/admin/roles         → Roles
/admin/settings/*    → Settings
```

**টপবার লেআউট (মোবাইল + ডেস্কটপ):**
```text
┌─[☰]──── Page Title ──────────── [🔔]─┐  (mobile)
└───────────────────────────────────────┘

┌──────── Page Title ──────────── [🔔]─┐  (desktop)
└───────────────────────────────────────┘
```

### ফাইল তালিকা
- `src/pages/admin/AdminLayout.tsx` — টপবারে টাইটেল ও মোবাইল visibility
- `src/pages/admin/AdminDashboardContent.tsx` — duplicate টাইটেল সেকশন সরানো

