

## ফিক্স: মোবাইলে "Back to Top" ফ্লোটিং বাটন যোগ

### পরিবর্তন — `src/pages/admin/AdminTicketing.tsx`

1. **স্ক্রল স্টেট ট্র্যাক করা** — `useState` + `useEffect` দিয়ে `window.scrollY > 300` হলে বাটন দেখানো
2. **ফ্লোটিং বাটন যোগ** — `fixed bottom-24 right-4 lg:hidden` পজিশনে (bottom-24 = মোবাইল ডকের উপরে, ওভারল্যাপ হবে না)
3. **স্মুথ স্ক্রল** — `window.scrollTo({ top: 0, behavior: 'smooth' })`
4. **AnimatePresence** দিয়ে fade in/out অ্যানিমেশন

```text
মোবাইল লেআউট:
┌─────────────────────┐
│  Content...         │
│                     │
│              [↑]  ← back to top (bottom-24 right-4)
│                     │
├─ Mobile Dock ───────┤  ← bottom-0
└─────────────────────┘
```

### ফাইল
- `src/pages/admin/AdminTicketing.tsx` — scroll listener + floating ArrowUp button

