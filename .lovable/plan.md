

## পরিবর্তন

মোবাইলে পেইজ টাইটেল বাম দিকের গ্রুপ (হ্যামবার্গার + লোগো) থেকে সরিয়ে ডানে বেল আইকনের বামে রাখা হবে।

### ফাইল: `src/pages/admin/AdminLayout.tsx` (line 117-131)

বর্তমান লেআউট:
```
[☰ Logo Title]          [🔔]
```

নতুন লেআউট (মোবাইল):
```
[☰ Logo]      [Title 🔔]
```

ডেস্কটপে টাইটেল বামেই থাকবে (হ্যামবার্গার ও লোগো hidden হয়ে যায়)।

**পরিবর্তন:**
- `<h1>` কে বাম গ্রুপ থেকে সরিয়ে ডান গ্রুপে `<NotificationBell />` এর আগে রাখা
- ডান গ্রুপে `flex items-center gap-2` দেওয়া

```tsx
<div className="flex items-center justify-between gap-2 px-3 md:px-6 h-12 border-b ...">
  <div className="flex items-center gap-2">
    <Button ... className="md:hidden h-8 w-8" ...><Menu /></Button>
    <img ... className="md:hidden h-7 w-auto cursor-pointer" />
  </div>
  <div className="flex items-center gap-2">
    <h1 className="text-sm md:text-base font-semibold truncate">{pageTitle}</h1>
    <NotificationBell />
  </div>
</div>
```

