

## /admin/roles রেসপনসিভ ফিক্স (390px ভিউপোর্ট)

### সমস্যা চিহ্নিত

1. **Role Cards grid `grid-cols-3`** — 390px এ 10টি কার্ড 3 কলামে cramped, badge text ও description কাটা যায়
2. **Permission Matrix টেবিল** — 5 কলাম (Module + 4 checkboxes) মোবাইলে overflow করে, `w-[200px]` + 4×`w-[100px]` = 600px মিনিমাম
3. **CardHeader** — Badge + "Permission Matrix" টেক্সট + Save বাটন একই row-তে মোবাইলে overflow
4. **Root div** — `overflow-hidden` নেই
5. **Save বাটন** — টেক্সট দেখানো অপ্রয়োজনীয় মোবাইলে

### পরিবর্তন — `AdminRoles.tsx` (১টি ফাইল)

**১. Root div**: `space-y-6` → `space-y-4 overflow-hidden`

**২. Role Cards grid**: `grid-cols-3` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` — মোবাইলে 2 কলাম, কার্ড পড়তে সুবিধা

**৩. Role Card padding**: `p-3` → `p-2 sm:p-3`

**৪. CardHeader**: flex direction মোবাইলে column, Save বাটন মোবাইলে icon-only
```
flex-col sm:flex-row gap-2
```
Save বাটন: `<span className="hidden sm:inline">Save</span>`

**৫. Permission Matrix — মোবাইল কার্ড ভিউ (`lg:hidden`)**
প্রতিটি module একটি কার্ডে:
- Module name (bold)
- 4টি checkbox inline grid (2×2): View, Create, Edit, Delete — label সহ
- `divide-y` দিয়ে আলাদা

**৬. ডেস্কটপ টেবিল `hidden lg:block`**
বিদ্যমান Table শুধু lg+ এ দেখাবে

### প্রভাব
- শুধুমাত্র ১টি ফাইল পরিবর্তন
- 390px এ Role cards ও Permission matrix সঠিকভাবে ফিট করবে
- অন্যান্য পেইজের compact design standard অনুসরণ করবে

