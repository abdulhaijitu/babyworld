

## /admin/expense-categories রেসপনসিভ ফিক্স

### সমস্যা (391px ভিউপোর্ট)
1. **৬-কলাম টেবিল সরাসরি দেখানো হচ্ছে** — মোবাইলে কার্ড ভিউ নেই, টেবিল ওভারফ্লো করে
2. **Root div-এ `overflow-hidden` নেই**
3. **Add বাটন** মোবাইলে ফুল টেক্সট দেখায়, জায়গা নষ্ট হয়
4. **DialogContent `max-w-md`** — বেস কম্পোনেন্টে ফিক্স হয়েছে কিন্তু এখানে explicit override আছে যা সরানো উচিত

### পরিবর্তন — `AdminExpenseCategories.tsx`

**১. Root div**: `space-y-6` → `space-y-4 overflow-hidden`

**২. Add বাটন কমপ্যাক্ট**: মোবাইলে আইকন-অনলি, `size="sm"`
```tsx
<Button size="sm">
  <Plus className="w-4 h-4 sm:mr-2" />
  <span className="hidden sm:inline">Add Category</span>
</Button>
```

**৩. DialogContent**: `max-w-md` → `sm:max-w-md` (বেস `max-w-[95vw]` কাজ করবে)

**৪. মোবাইল কার্ড ভিউ যোগ (`lg:hidden`)**
প্রতিটি ক্যাটাগরি একটি কার্ডে:
- Label + System Name (truncate)
- Color badge, Icon name
- Status switch + Edit/Delete বাটন একই row-তে
- `divide-y` দিয়ে আলাদা করা

**৫. ডেস্কটপ টেবিল `hidden lg:block`**
বিদ্যমান Table শুধু lg+ এ দেখাবে

### প্রভাব
- শুধুমাত্র ১টি ফাইল পরিবর্তন
- Income Categories পেইজের সাথে সামঞ্জস্যপূর্ণ প্যাটার্ন

