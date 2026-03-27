

## পরিকল্পনা: অ্যাডমিন মোবাইল বটম নেভিগেশন বারকে Dock স্টাইলে রূপান্তর

### সমস্যা
বর্তমান বটম নেভিগেশন বার সাধারণ ডিজাইন — Dock কম্পোনেন্টের মতো glowing ring effect, spring animation, এবং tooltip নেই।

### সমাধান
`AdminMobileBottomNav.tsx` কে Dock কম্পোনেন্টের স্টাইলে আপডেট করা হবে। Dock component আলাদা ফাইলে রাখার দরকার নেই — সরাসরি বটম নেভে Dock-এর ফিচারগুলো যোগ করবো।

### পরিবর্তন

**`src/components/admin/AdminMobileBottomNav.tsx` আপডেট:**

1. **Tooltip যোগ** — প্রতিটি ট্যাবে `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` ব্যবহার
2. **Hover/Press অ্যানিমেশন** — `motion.div` দিয়ে spring-based scale (1.2x) ও slight rotation (-5°) on hover/press
3. **Glowing ring effect** — active/hovered আইটেমে `bg-primary/20` গ্লো ring অ্যানিমেশন
4. **Active indicator** — বর্তমান dot-এর পরিবর্তে animated bar/pill indicator
5. **Dock-স্টাইল container** — `bg-card/90 backdrop-blur-xl` সহ rounded container, `shadow-lg`
6. **স্ক্রল হাইড** — বর্তমান scroll hide/show লজিক রাখা হবে
7. **"More" বাটনেও** একই স্টাইল প্রয়োগ

### ডিজাইন ডিটেইলস
- আইকন সাইজ: `w-5 h-5`, hover-এ spring scale `1.2`
- Glowing ring: `absolute inset-0 rounded-full bg-primary/20 blur-md` (AnimatePresence সহ)
- Active dot: `layoutId` spring অ্যানিমেশন বজায় থাকবে
- Container: centered pill shape with `rounded-2xl` এবং `mx-4 mb-2` margin
- Dependencies: `framer-motion`, `@radix-ui/react-tooltip` ইতোমধ্যে ইনস্টল আছে

### ফাইল
- `src/components/admin/AdminMobileBottomNav.tsx` — সম্পূর্ণ রিডিজাইন

