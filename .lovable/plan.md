

## Footer Section UI/UX অডিট ও ফিক্স

### চিহ্নিত সমস্যাগুলো

1. **মোবাইলে Footer কন্টেন্ট MobileBottomNav দ্বারা ঢাকা পড়ে** — Footer এর নিচে `h-20` spacer আছে প্রতিটি পেজে, কিন্তু Footer নিজের ভেতরে কোনো bottom padding নেই — তাই copyright সেকশন কাটা যেতে পারে
2. **"Gallery" লিংক হার্ডকোডেড** — অন্য সব লিংক `t()` translation ব্যবহার করে, কিন্তু Gallery সরাসরি স্ট্রিং
3. **Opening Hours অনুপস্থিত** — একটি প্লেগ্রাউন্ড ওয়েবসাইটের Footer-এ সময়সূচী থাকা উচিত
4. **Social Links আইকনের ভিজ্যুয়াল ফিডব্যাক দুর্বল** — footer variant-এ hover ইফেক্ট সূক্ষ্ম (শুধু opacity)
5. **Contact আইকনগুলো flex-shrink হয় না** — Phone ও Mail আইকনে `flex-shrink-0` নেই
6. **Copyright সেকশনে "Developed by" ক্রেডিট নেই** — ঐচ্ছিক, তবে প্রফেশনাল
7. **Quick Links-এ hover underline নেই** — শুধু opacity চেঞ্জ হয়, underline থাকলে আরও ক্লিয়ার হতো

### পরিবর্তন: `src/components/Footer.tsx`

1. **Opening Hours সেকশন যোগ** — Quick Links ও Contact এর মাঝে বা Contact কলামে যোগ
2. **Quick Links hover-এ underline** যোগ — `hover:underline underline-offset-4`
3. **Contact আইকনে `flex-shrink-0`** যোগ — Phone ও Mail আইকনে
4. **"Gallery" হার্ডকোড ফিক্স** — translation key ব্যবহার অথবা যেহেতু ইংরেজি-only সাইট, consistent রাখা
5. **মোবাইলে footer bottom padding** — `pb-4 lg:pb-0` যোগ যাতে bottom nav দ্বারা কন্টেন্ট না ঢাকে
6. **Social Links hover উন্নত** — scale ইফেক্ট যোগ
7. **Grid লেআউট উন্নত** — মোবাইলে Brand সেকশন center-aligned করা

### পরিবর্তন: `src/components/SocialLinks.tsx`

- Footer variant-এ `hover:scale-110` ট্রানজিশন যোগ

### পরিবর্তন: `src/lib/translations.ts`

- `"footer.openingHours"`, `"footer.gallery"` key যোগ (যদি প্রয়োজন)

### ফাইল তালিকা
- `src/components/Footer.tsx` (এডিট)
- `src/components/SocialLinks.tsx` (এডিট)
- `src/lib/translations.ts` (এডিট)

