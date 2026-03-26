

## Plan: Sidebar-তে TICKETING-এর নিচে Sub-menu যোগ করা

### সমস্যা
বর্তমানে TICKETING একটি একক লিংক। ইউজার চায় এটি expandable হবে এবং নিচে "Create Ticket" ও "Ticket List" সাব-আইটেম থাকবে।

### পদ্ধতি

**1. নতুন রাউট তৈরি করা (App.tsx)**
- `/admin/ticketing` → Ticket List (ডিফল্ট)
- `/admin/ticketing/create` → Create Ticket

বর্তমানে `AdminTicketing.tsx` ফাইলে Tabs দিয়ে দুটো ভিউ আছে। এগুলোকে আলাদা রাউটে ভাগ করতে হবে অথবা URL query/param দিয়ে ট্যাব কন্ট্রোল করতে হবে।

**সহজতম পদ্ধতি**: রাউট আলাদা না করে, sidebar থেকে navigate করার সময় URL query parameter (`?tab=create` / `?tab=list`) পাঠানো এবং `AdminTicketing`-এ সেই param অনুযায়ী ট্যাব সিলেক্ট করা।

**2. Sidebar Menu Structure আপডেট (AdminSidebar.tsx)**
- `MenuItem` interface-এ optional `children` ফিল্ড যোগ করা
- TICKETING আইটেমকে parent বানানো, দুটো child সহ:
  - Create Ticket → `/admin/ticketing?tab=create`
  - Ticket List → `/admin/ticketing?tab=list`
- Parent আইটেমে ক্লিক করলে expand/collapse হবে (Collapsible ব্যবহার করে)
- ChevronDown/ChevronUp আইকন দিয়ে expand state ইনডিকেট করা
- Active route হলে parent auto-expand থাকবে

**3. AdminTicketing.tsx আপডেট**
- URL search params (`useSearchParams`) থেকে `tab` value পড়া
- সেই অনুযায়ী Tabs component-এর `value` সেট করা
- Tab পরিবর্তন হলে URL param ও আপডেট করা

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | MenuItem interface-এ `children` যোগ, collapsible sub-menu রেন্ডারিং |
| `src/pages/admin/AdminTicketing.tsx` | URL search param থেকে active tab কন্ট্রোল |

### Technical Details
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible` ব্যবহার করা হবে
- `useSearchParams` from `react-router-dom` ব্যবহার করা হবে AdminTicketing-এ
- Collapsed sidebar-এ শুধু parent icon দেখাবে, sub-items hide থাকবে
- Mobile sheet-এও একই expandable behavior কাজ করবে

