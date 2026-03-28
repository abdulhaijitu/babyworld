

## /admin/leads পেইজের হরিজন্টাল স্ক্রলিং ফিক্স

### সমস্যা চিহ্নিত

কোড অডিটে নিম্নলিখিত সমস্যাগুলো পাওয়া গেছে যেগুলো ৩৯১px ভিউপোর্টে হরিজন্টাল ওভারফ্লো সৃষ্টি করতে পারে:

1. **AdminLayout.tsx (line 101)**: মূল কন্টেইনারে `overflow-x-hidden` নেই — চাইল্ড এলিমেন্টের যেকোনো ওভারফ্লো পুরো পেইজে স্ক্রল তৈরি করে
2. **AdminLayout.tsx (line 111)**: `<main>` এলিমেন্টে `overflow-hidden` নেই
3. **AdminLeads.tsx (line 394)**: মূল `<div>` এ `overflow-hidden` নেই
4. **AdminLeads.tsx (line 455)**: `TabsList` এর `w-max` ক্লাস ScrollArea-র বাইরে ফুটো হতে পারে
5. **AdminLeads.tsx (line 473)**: বাল্ক অ্যাকশন বারের `flex-wrap` ছোট স্ক্রিনে যথেষ্ট নয়
6. **AdminLeads.tsx (line 167, 213)**: SMS ও WhatsApp বাটনগুলোতে মোবাইলে ছোট সাইজ (`h-7 w-7`) দরকার

### পরিবর্তন পরিকল্পনা

**ফাইল ১: `src/pages/admin/AdminLayout.tsx`**
- Line 101: মূল `div`-এ `overflow-x-hidden` যোগ
- Line 111: `<main>`-এ `min-w-0 overflow-x-hidden` যোগ — এটি flex child-এর ওভারফ্লো ঠেকাবে

**ফাইল ২: `src/pages/admin/AdminLeads.tsx`**
- Line 394: root div-এ `overflow-hidden` যোগ
- Line 453-465: ScrollArea-র ভেতর TabsList ঠিকমতো কন্টেইন করা — `whitespace-nowrap` নিশ্চিত করা
- Line 473-478: বাল্ক অ্যাকশন বারে বাটনগুলো ছোট করা, টেক্সট `text-xs` ও `gap-2`
- Line 493-546: মোবাইল কার্ড ভিউতে সমস্ত টেক্সট `truncate` ও `min-w-0` নিশ্চিত করা
- Line 523-541: অ্যাকশন বাটনগুলো `flex-shrink-0` দিয়ে wrap-proof করা
- Line 403: ডায়ালগ `max-w-2xl` → `max-w-[95vw] sm:max-w-2xl` করা

### প্রভাব
- AdminLayout-এর ফিক্স সব /admin পেইজে কাজ করবে
- শুধুমাত্র ২টি ফাইলে পরিবর্তন

