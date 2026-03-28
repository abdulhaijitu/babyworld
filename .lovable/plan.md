

## /admin/reports রেসপনসিভ ফিক্স

391px ভিউপোর্টে যে সমস্যাগুলো আছে:

### সমস্যা চিহ্নিত

1. **AdminReports.tsx**: TabsList 5টি ট্যাব — মোবাইলে overflow হয়, Print/Export বাটন টেক্সট দেখায়
2. **ReportsSummaryCards.tsx**: `grid-cols-2` ঠিক আছে কিন্তু `text-lg` value মোবাইলে বড়
3. **RevenueReport.tsx**: `text-4xl` revenue মোবাইলে বড়, chart height 350px/300px অতিরিক্ত, `p-4` padding বড়, Payment Method কার্ডে `text-2xl` overflow করে
4. **TicketSalesReport.tsx**: `grid-cols-2 md:grid-cols-4` summary cards ঠিক, কিন্তু chart 220px যথেষ্ট
5. **FoodSalesReport.tsx**: PieChart label মোবাইলে overlap করে, All Items টেবিল মোবাইলে overflow
6. **ComparisonCharts.tsx**: Weekly bar chart `YAxis width={100}` মোবাইলে অনেক জায়গা নেয়, chart heights বড়
7. **PrintableReport.tsx**: `grid-cols-3` revenue summary মোবাইলে cramped, `grid-cols-2` ticket/food stats, `inset-4` মোবাইলে কম জায়গা

### পরিবর্তন পরিকল্পনা — ৭টি ফাইল

**১. AdminReports.tsx**
- TabsList: `overflow-x-auto` যোগ, ট্যাব টেক্সট ছোট করা
- Print/Export বাটন: মোবাইলে আইকন-অনলি (`hidden sm:inline`)
- Root: `space-y-6` → `space-y-4 overflow-hidden`

**২. ReportsSummaryCards.tsx**
- `grid-cols-3` → `grid-cols-2` মোবাইলে (already is), compact padding `p-2 sm:p-4`
- Value: `text-lg` → `text-base sm:text-lg`, title: `text-[10px] sm:text-xs`

**৩. RevenueReport.tsx**
- Total Revenue: `text-4xl` → `text-2xl sm:text-4xl`, icon padding `p-2 sm:p-4`
- Charts: height `350` → `250` মোবাইলে (use responsive height e.g. 220 on mobile)
- Payment cards: `text-2xl` → `text-lg sm:text-2xl`, `p-4` → `p-3 sm:p-4`
- Revenue breakdown grid: `grid-cols-2` → `p-2 sm:p-4` compact

**৪. TicketSalesReport.tsx**
- Summary cards: `p-4` → `p-2 sm:p-4`, icon `w-8 h-8` → `w-6 h-6 sm:w-8 sm:h-8`
- Value: `text-2xl` → `text-lg sm:text-2xl`

**৫. FoodSalesReport.tsx**
- Summary cards: same compact treatment
- PieChart: `innerRadius/outerRadius` ছোট, label off on mobile
- All Items Table: মোবাইল কার্ড ভিউ (`lg:hidden`) + desktop table (`hidden lg:block`)

**৬. ComparisonCharts.tsx**
- Weekly bar chart: `YAxis width={100}` → `width={70}`, chart height reduce
- Weekly comparison cards: `grid-cols-1 md:grid-cols-3` → `grid-cols-3` always with compact padding
- Value: `text-2xl` → `text-base sm:text-2xl`

**৭. PrintableReport.tsx**
- `inset-4` → `inset-1 sm:inset-4`
- Revenue grid: `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`
- Ticket/Food stats: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- `p-8` → `p-3 sm:p-8`
- Values: `text-2xl` → `text-lg sm:text-2xl`

### প্রভাব
- সকল রিপোর্ট কম্পোনেন্ট 391px এ সঠিকভাবে ফিট করবে
- চার্ট মোবাইলে কম উচ্চতা নেবে, স্ক্রল কমবে
- টেবিল → কার্ড ভিউ প্যাটার্ন অনুসরণ করবে
- প্রিন্ট প্রিভিউ মোবাইলে ব্যবহারযোগ্য হবে

