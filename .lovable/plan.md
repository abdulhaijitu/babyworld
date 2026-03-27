

## Fix: Admin Pages Missing Content Padding

### Problem
Many admin pages have their root `<div>` with only `className="space-y-6"` but no padding, so the content touches the sidebar edge. Some pages already have `p-4 md:p-6` or `p-4 md:p-6 lg:p-8` — those are fine.

### Solution
**Single fix in `AdminLayout.tsx`** — add padding to the `<Outlet />` wrapper in the layout instead of fixing each page individually. This ensures all child pages get consistent padding automatically.

Change in `AdminLayout.tsx` line 60:
```tsx
// Before
<Outlet />

// After
<div className="p-4 md:p-6 lg:p-8">
  <Outlet />
</div>
```

Then **remove duplicate padding** from pages that already have their own `p-4 md:p-6` wrapper to avoid double padding. These pages need their root padding class removed:

1. `AdminAboutContact.tsx` — `p-4 md:p-6` → remove
2. `AdminCoupons.tsx` — `p-4 md:p-6` → remove
3. `AdminDailyCashSummary.tsx` — `p-4 md:p-6 lg:p-8` → remove
4. `AdminDashboardContent.tsx` — `p-4 md:p-6 lg:p-8` → remove
5. `AdminEmployees.tsx` — `p-4 md:p-6 lg:p-8` → remove
6. `AdminExpenseCategories.tsx` — check & remove
7. `AdminExpenses.tsx` — check & remove
8. `AdminFoodOrders.tsx` — check & remove
9. `AdminFoodPOS.tsx` — check & remove
10. `AdminFoodSales.tsx` — `p-4 md:p-6 lg:p-8` → remove
11. `AdminHomepage.tsx` — `p-4 md:p-6` → remove
12. `AdminIncome.tsx` — check & remove
13. `AdminIncomeCategories.tsx` — `p-4 md:p-6 lg:p-8` → remove
14. `AdminRides.tsx` — `p-4 md:p-6 lg:p-8` → remove
15. `AdminSeoBranding.tsx` — `p-4 md:p-6` → remove
16. `AdminSettings.tsx` — check & remove
17. Settings sub-pages (`SettingsGeneral`, `SettingsPricing`, `SettingsSms`, etc.) — check & remove
18. All other pages under `/admin/*` — verify and normalize

### Result
- Every admin page gets uniform `p-4 md:p-6 lg:p-8` padding from the layout
- No content touches the sidebar
- No double-padding on pages that had their own

