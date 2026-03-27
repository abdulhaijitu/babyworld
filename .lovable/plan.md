

## ফিক্স: টপবার হাইট সাইডবারের সাথে সমান করা

### সমস্যা
সাইডবারের হেডার `h-12` (48px) কিন্তু মেইন কন্টেন্টের টপবার `py-2 md:py-3` — ফলে দুটোর হাইট মিলছে না।

### সমাধান
`AdminLayout.tsx`-এ টপবারে `py-2 md:py-3` সরিয়ে `h-12` সেট করা — যাতে সাইডবার হেডারের সাথে পিক্সেল-পারফেক্ট মিলে যায়।

### পরিবর্তন

**`src/pages/admin/AdminLayout.tsx` (১টি লাইন)**

```tsx
// আগে:
<div className="flex items-center justify-between gap-2 px-3 md:px-6 py-2 md:py-3 border-b ...">

// পরে:
<div className="flex items-center justify-between gap-2 px-3 md:px-6 h-12 border-b ...">
```

`py-2 md:py-3` → `h-12` — এটাই একমাত্র পরিবর্তন।

