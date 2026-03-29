

## Admin টপবার রিডিজাইন — ছবির মতো Breadcrumb + Quick Actions স্টাইল

### বর্তমান অবস্থা
- সিম্পল `h-12` বার: বামে মোবাইল মেনু/লোগো, ডানে পেইজ টাইটেল + নোটিফিকেশন বেল
- কোনো breadcrumb নেই, কোনো quick action বাটন নেই

### রেফারেন্স ইমেজ বিশ্লেষণ
- **বামে**: Breadcrumb (PAGES → DASHBOARD) ছোট uppercase টেক্সটে, নিচে বড় পেইজ টাইটেল "Overview"
- **ডানে**: Quick action বাটন (Guest Checkout, E-commerce POS, Visit Website) + User avatar/dropdown
- ক্লিন, minimal ডিজাইন, পর্যাপ্ত vertical spacing

### পরিবর্তন পরিকল্পনা — `AdminLayout.tsx` (১টি ফাইল)

**১. টপবার উচ্চতা বাড়ানো**: `h-12` → `h-14 md:h-16` — breadcrumb + title দুই লাইনে জায়গা দিতে

**২. বাম পাশে Breadcrumb + Title (ডেস্কটপে)**
- উপরে: `ADMIN → [Parent Section]` ছোট uppercase muted টেক্সটে, `→` separator সহ
- নিচে: পেইজ টাইটেল bold, `text-lg`
- Breadcrumb তৈরি হবে `routeTitleMap` + sidebar menu structure থেকে — route path দেখে parent group বের করা হবে (যেমন `/admin/create-ticket` → `ADMIN → TICKETING`)

**৩. ডান পাশে Quick Actions (ডেস্কটপে)**
- "Visit Website" বাটন (external link, নতুন ট্যাবে `/` ওপেন করবে)
- "Create Ticket" বাটন (navigate `/admin/create-ticket`)
- NotificationBell (আগের মতো)
- বাটনগুলো dark variant, icon সহ, রেফারেন্সের মতো

**৪. মোবাইল ভিউ**
- বামে: হ্যামবার্গার + লোগো (আগের মতো)
- ডানে: শুধু পেইজ টাইটেল (ছোট) + NotificationBell
- Breadcrumb ও quick action বাটন `hidden md:flex` — মোবাইলে লুকানো

**৫. Breadcrumb লজিক**
- `allMenuItems` থেকে parent-child ম্যাপিং ব্যবহার করে current route-এর parent section বের করা
- যেমন: `/admin/payroll` → breadcrumb: `ADMIN → HUMAN RESOURCES`, title: `Payroll`
- `/admin` → breadcrumb: `ADMIN`, title: `Dashboard`

### ডিজাইন স্টাইল
- Breadcrumb: `text-[11px] uppercase tracking-wider text-muted-foreground font-medium`
- Separator: `→` character, `text-primary` রঙে
- Title: `text-base md:text-lg font-semibold text-foreground`
- Quick action buttons: `variant="default"` dark, `size="sm"`, icon + label
- সামগ্রিক: ক্লিন, professional, রেফারেন্স ইমেজের aesthetic অনুসরণ

### মোবাইল রেসপনসিভনেস
- Breadcrumb ও quick actions শুধু `md:` breakpoint-এ দেখাবে
- মোবাইলে compact `h-12` থাকবে, ডেস্কটপে `h-16`

