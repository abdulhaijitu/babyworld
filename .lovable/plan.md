

## পরিকল্পনা: `/admin/rides` পেইজ অডিট ও ফিক্স

### সমস্যা চিহ্নিত

| # | সমস্যা | তীব্রতা |
|---|--------|---------|
| 1 | `name_bn` ফর্মে এখনও আছে (`defaultFormData`, interface, mutations) — আগের ক্লিনআপে UI ফিল্ড বাদ হলেও ডেটা লেয়ারে রয়ে গেছে | Bug |
| 2 | `avg_rating` ও `review_count` টেবিলে দেখানো হচ্ছে না — রাইডের রেটিং তথ্য মিসিং | UX |
| 3 | Create ও Edit ডায়ালগে প্রায় একই কোড দুইবার লেখা (DRY violation) — ~140 লাইন ডুপ্লিকেট | Code quality |
| 4 | Edit ডায়ালগে `DialogDescription` নেই — accessibility warning | Bug |
| 5 | ক্যাটাগরি ফিল্টার নেই — সব রাইড একসাথে দেখায়, ফিল্টার করার উপায় নেই | UX |
| 6 | টেবিলে inactive রাইড আলাদা করা যায় না — ভিজুয়ালি পার্থক্য নেই | UX |
| 7 | Stats cards-এ "Family/Thrill" একত্রে — আলাদা করলে বেশি তথ্যবহুল | UX |

### পরিবর্তনসমূহ

#### ফাইল: `src/pages/admin/AdminRides.tsx`

1. **`name_bn` সম্পূর্ণ রিমুভ**: `Ride` interface, `defaultFormData`, `handleEdit`, create/update mutation থেকে `name_bn` বাদ
2. **Rating/Review কলাম যোগ**: টেবিলে "Rating" কলাম — স্টার আইকন + `avg_rating` ও `review_count` দেখাবে
3. **ক্যাটাগরি ফিল্টার যোগ**: টেবিল কার্ডের হেডারে Select ড্রপডাউন — All/Kids/Family/Thrill
4. **Inactive রাইড ভিজুয়াল**: inactive রাইডের row তে `opacity-50` ক্লাস
5. **Edit dialog-এ `DialogDescription` যোগ**
6. **DRY ফিক্স**: ফর্ম রেন্ডারিং একটি `renderRideForm()` ফাংশনে extract করা — Create ও Edit উভয় ডায়ালগে ব্যবহার
7. **Stats cards আপডেট**: 5টি কার্ড — Total, Active, Kids, Family, Thrill (2+3 গ্রিড বা 5-কলাম)

#### ফাইল: `src/pages/admin/AdminRideReviews.tsx`
- `name_bn` রেফারেন্স রিমুভ (Ride interface থেকে, select query থেকে)

### সারাংশ
মূলত `name_bn` ক্লিনআপ, রেটিং ডিসপ্লে, ক্যাটাগরি ফিল্টার, ফর্ম DRY ফিক্স, এবং inactive ভিজুয়াল — দুইটি ফাইলে পরিবর্তন।

