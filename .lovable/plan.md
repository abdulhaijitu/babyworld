

## পরিকল্পনা: Frontend মেনু গ্রুপ যোগ করা

Accounts গ্রুপের পরে একটি নতুন **Frontend** কলাপসিবল মেনু গ্রুপ যোগ হবে। বর্তমান স্ট্যান্ডঅ্যালোন "Homepage" মেনু আইটেমটি সরিয়ে এর কন্টেন্ট Frontend গ্রুপের সাবমেনুতে ঢুকবে।

### সাবমেনু স্ট্রাকচার

| সাবমেনু | আইকন | পাথ | বিবরণ |
|---------|-------|-----|-------|
| Homepage | Home | /admin/homepage | Hero Slider + Offer Cards (বিদ্যমান) |
| Hero Slides | SlidersHorizontal | /admin/hero-slides | সরাসরি স্লাইডার ম্যানেজমেন্ট |
| Hero Cards | ImageIcon | /admin/hero-cards | অফার/ইভেন্ট কার্ড ম্যানেজমেন্ট |

### পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `AdminSidebar.tsx` | স্ট্যান্ডঅ্যালোন `homepage` আইটেম সরিয়ে Accounts-এর পরে নতুন `frontend` গ্রুপ যোগ (Homepage, Hero Slides, Hero Cards সাবমেনুসহ) |
| `App.tsx` | `/admin/hero-slides` ও `/admin/hero-cards` রাউট যোগ |

### কারিগরি বিবরণ

- `AdminHeroSlides` ও `AdminHeroCards` ইম্পোর্ট ইতিমধ্যে `App.tsx`-এ আছে, শুধু রাউট যোগ করলেই হবে
- সাইডবারে `Monitor` আইকন ব্যবহার হবে Frontend গ্রুপের জন্য
- `requiredRoles: ['super_admin', 'admin']` বজায় থাকবে

