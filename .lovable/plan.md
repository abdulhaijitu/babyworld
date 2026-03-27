

## পরিকল্পনা: মোবাইল ভিউ কমপ্যাক্ট পলিশ

### পরিবর্তন সমূহ

**1. AdminLayout — মোবাইল প্যাডিং কমানো**
- `p-4 md:p-6 lg:p-8` → `p-3 md:p-6 lg:p-8` (মোবাইলে কম প্যাডিং)
- `pt-14` → `pt-2` (টপ স্পেস কমানো, সাইডবার মোবাইলে overlay তাই extra top padding দরকার নেই)

**2. AdminDashboardContent — কমপ্যাক্ট মোবাইল ড্যাশবোর্ড**
- `space-y-6` → `space-y-4 md:space-y-6`
- Page title: `text-2xl` → `text-xl md:text-2xl`
- Visitor counter icon: `h-12 w-12` → `h-10 w-10 md:h-12 md:w-12`, visitor total `text-3xl` → `text-2xl md:text-3xl`
- Visitor breakdown: `gap-6` → `gap-4 md:gap-6`, `text-xl` → `text-lg md:text-xl`
- Revenue cards grid: `gap-4` → `gap-3 md:gap-4`, `grid-cols-1 sm:grid-cols-2` → `grid-cols-2 sm:grid-cols-2` (মোবাইলেও ২ কলাম)
- Revenue card header: `text-2xl` → `text-lg md:text-2xl`
- CardHeader padding: `pb-2` → `pb-1 md:pb-2`, CardContent-এ `pt-0` নিশ্চিত
- Bottom lists grid: `gap-6` → `gap-4 md:gap-6`
- Recent items padding: `p-2.5` → `p-2 md:p-2.5`

**3. পাবলিক পেইজসমূহ — কমপ্যাক্ট সেকশন**
- **HeroSection**: চেক ও টাইটের করা (ইতোমধ্যে responsive হলে স্কিপ)
- **AboutSection**: `py-16` → `py-12 md:py-16`, heading `text-3xl` → `text-2xl md:text-3xl`
- **VideoSection**: `py-16` → `py-12 md:py-16`
- **TestimonialsSection**: `py-16` → `py-12 md:py-16`
- **ContactSection**: `py-16` → `py-12 md:py-16`
- **PricingSection**: `py-16` → `py-12 md:py-16`

**4. PlayBooking পেইজ — কমপ্যাক্ট**
- FAQ section `py-24` জাতীয় বড় স্পেসিং → `py-12 md:py-20`

### ফাইল তালিকা
- `src/pages/admin/AdminLayout.tsx`
- `src/pages/admin/AdminDashboardContent.tsx`
- `src/components/AboutSection.tsx`
- `src/components/VideoSection.tsx`
- `src/components/TestimonialsSection.tsx`
- `src/components/ContactSection.tsx`
- `src/components/PricingSection.tsx`
- `src/components/PlayFAQ.tsx`

### টেকনিক্যাল নোট
- শুধু Tailwind ক্লাস পরিবর্তন, কোনো লজিক পরিবর্তন নেই
- মোবাইলে ২-কলাম revenue grid dashboard-কে অনেক বেশি compact করবে
- সব পরিবর্তন ডেস্কটপে একই রকম থাকবে, শুধু মোবাইল breakpoint-এ কমপ্যাক্ট হবে

