

## ব্যাক টু টপ ফ্লোটিং বাটন যোগ

### নতুন ফাইল: `src/components/ScrollToTop.tsx`
- একটি ফ্লোটিং বাটন যা পেজ নিচে স্ক্রল করলে দেখা যাবে (300px+ স্ক্রল)
- `ArrowUp` Lucide আইকন ব্যবহার
- ক্লিকে `window.scrollTo({ top: 0, behavior: 'smooth' })`
- **পজিশন**: WhatsApp বাটন (`bottom-24 lg:bottom-6 right-4`) এর উপরে বসবে — `bottom-40 lg:bottom-20 right-4 lg:right-6` — যাতে ওভারল্যাপ না হয়
- Fade-in/out অ্যানিমেশন (framer-motion)
- `z-40` — WhatsApp বাটনের সমান z-index

### পরিবর্তন: `src/App.tsx`
- `ScrollToTop` কম্পোনেন্ট ইমপোর্ট করে public রাউটগুলোতে (WhatsAppButton-এর পাশে) রেন্ডার করা

### পজিশনিং ম্যাপ
```text
মোবাইল:
  bottom-40  → ScrollToTop
  bottom-24  → WhatsApp
  bottom-0   → MobileBottomNav

ডেস্কটপ:
  bottom-20  → ScrollToTop
  bottom-6   → WhatsApp
```

**ফাইল:** `src/components/ScrollToTop.tsx` (নতুন), `src/App.tsx` (এডিট)

