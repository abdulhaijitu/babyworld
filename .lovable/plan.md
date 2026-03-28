

## পরিবর্তন

`AdminLayout.tsx`-এর মোবাইল টপ বারে হ্যামবার্গার বাটনের পাশে Baby World লোগো যোগ করা হবে। ডেস্কটপে লোগো লুকানো থাকবে কারণ সাইডবারে ইতিমধ্যেই লোগো আছে।

### ফাইল: `src/pages/admin/AdminLayout.tsx`

- `babyWorldLogo` ইমপোর্ট যোগ
- হ্যামবার্গার বাটনের পরে `md:hidden` লোগো ইমেজ যোগ (h-7, auto width)
- পেইজ টাইটেল সব স্ক্রিনে দেখাবে

```tsx
<div className="flex items-center gap-2">
  <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" ...>
    <Menu />
  </Button>
  <img src={babyWorldLogo} alt="Baby World" className="md:hidden h-7 w-auto" />
  <h1 className="text-sm md:text-base font-semibold truncate">{pageTitle}</h1>
</div>
```

