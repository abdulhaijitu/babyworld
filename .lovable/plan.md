

## ফিক্স: পেইজ হেডিং ডুপ্লিকেশন সরানো

### সমস্যা
টপবারে `routeTitleMap` থেকে ডাইনামিক টাইটেল দেখাচ্ছে এবং প্রতিটি পেইজের কন্টেন্টেও আলাদা `<h1>` টাইটেল আছে — ফলে ডাবল হেডিং দেখা যাচ্ছে।

### সমাধান
প্রতিটি অ্যাডমিন পেইজ থেকে `<h1>` টাইটেল ব্লক সরানো হবে। তবে টাইটেলের পাশে যদি অ্যাকশন বাটন (Create Ticket, Scan QR, Add Employee ইত্যাদি) থাকে, সেই বাটনগুলো রাখা হবে — শুধু টাইটেল + subtitle/description সরানো হবে।

### পরিবর্তন প্যাটার্ন

**আগে:**
```tsx
<div className="flex ... justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold ...">
      <Icon /> Page Title
    </h1>
    <p className="text-muted-foreground">Description</p>
  </div>
  <div className="flex gap-2">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>
```

**পরে:**
```tsx
<div className="flex justify-end gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

যদি কোনো অ্যাকশন বাটন না থাকে, পুরো wrapper div সরিয়ে দেওয়া হবে।

### ফাইল তালিকা (৪০+ ফাইল)
সকল `src/pages/admin/` ফোল্ডারের ফাইল যেখানে `<h1>` আছে:
- `AdminTicketing.tsx`, `AdminEmployees.tsx`, `AdminBookings.tsx`, `AdminExpenses.tsx`, `AdminIncome.tsx`, `AdminMemberships.tsx`, `AdminMembershipPackages.tsx`, `AdminLeads.tsx`, `AdminSmsCampaigns.tsx`, `AdminSocialMedia.tsx`, `AdminRoster.tsx`, `AdminEventCalendar.tsx`, `AdminLeaveManagement.tsx`, `AdminMemberEntry.tsx`, `AdminRides.tsx`, `AdminEvents.tsx`, `AdminEventPackages.tsx`, `AdminCoupons.tsx`, `AdminFoodSales.tsx`, `AdminFoodOrders.tsx`, `AdminFoodPOS.tsx`, `AdminGateLogs.tsx`, `AdminAttendance.tsx`, `AdminPayroll.tsx`, `AdminPerformance.tsx`, `AdminPromotions.tsx`, `AdminReports.tsx`, `AdminProfitReports.tsx`, `AdminExpenseCategories.tsx`, `AdminIncomeCategories.tsx`, `AdminDailyCashSummary.tsx`, `AdminNotificationLogs.tsx`, `AdminHomepage.tsx`, `AdminHeroSlides.tsx`, `AdminHeroCards.tsx`, `AdminAboutContact.tsx`, `AdminSeoBranding.tsx`, `AdminUsers.tsx`, `AdminRoles.tsx`, `AdminSettings.tsx`, `AdminCreateTicket.tsx`
- `settings/SettingsGeneral.tsx`, `settings/SettingsEmail.tsx`, `settings/SettingsPricing.tsx`, `settings/SettingsPayment.tsx`, `settings/SettingsNotifications.tsx`, `settings/SettingsSms.tsx`, `settings/SettingsBusiness.tsx`

### টেকনিক্যাল নোট
- শুধু heading (`<h1>` + subtitle `<p>`) সরানো হবে
- অ্যাকশন বাটনগুলো সংরক্ষিত থাকবে, `flex justify-end` দিয়ে ডানে align করা হবে
- কোনো লজিক বা ফাংশনালিটি পরিবর্তন নেই

