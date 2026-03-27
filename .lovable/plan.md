

## পরিকল্পনা: সকল পেইজ রেসপনসিভ হার্ড পলিশ

### সমস্যাগুলো চিহ্নিত

কোডবেস রিভিউ করে নিচের রেসপনসিভ সমস্যাগুলো পাওয়া গেছে:

### পরিবর্তন

**1. PlayBooking ও BirthdayEvents — বটম স্পেসার ফিক্স**
- `h-4` → `h-20` করা হবে যাতে বটম নেভের পেছনে কন্টেন্ট লুকিয়ে না যায়

**2. NotFound পেইজ — রেসপনসিভ টেক্সট ও বটম নেভ**
- `text-8xl` → `text-6xl sm:text-8xl`, `text-6xl` → `text-4xl sm:text-6xl`
- `overflow-x-hidden` যোগ
- MobileBottomNav ও বটম স্পেসার যোগ
- মোবাইলে `py-24` → `py-12 sm:py-24`

**3. EventPackages — কন্টেইনার প্যাডিং ও সেকশন স্পেসিং**
- `py-24` → `py-16 sm:py-20 lg:py-24`
- কন্টেইনারে `px-4 sm:px-6` যোগ
- `mb-16` → `mb-10 sm:mb-12 lg:mb-16`

**4. EventsGallery — কন্টেইনার প্যাডিং ও সেকশন স্পেসিং**
- `py-24` → `py-16 sm:py-20 lg:py-24`
- কন্টেইনারে `px-4 sm:px-6` যোগ
- `mb-12` → `mb-8 sm:mb-10 lg:mb-12`
- গ্যালারি গ্রিডে `gap-3 sm:gap-4` করা

**5. EventBookingForm — সেকশন স্পেসিং ও কন্টেইনার**
- `py-24` → `py-16 sm:py-20 lg:py-24` (দুটি জায়গায় — ফর্ম ও সাকসেস)
- কন্টেইনারে `px-4 sm:px-6` যোগ
- `mb-12` → `mb-8 sm:mb-10 lg:mb-12`
- Step indicators: `w-10 h-10` → `w-8 h-8 md:w-12 md:h-12`
- Success state: `p-8 md:p-12` → `p-6 sm:p-8 md:p-12`

**6. ContactForm — মোবাইল প্যাডিং**
- `p-8` → `p-5 sm:p-6 md:p-8`

**7. GoogleMap — মোবাইল overlay ফিক্স**
- Map overlay: `max-w-xs` এ `hidden sm:block` যোগ (ছোট স্ক্রিনে ওভারল্যাপ হয়)

**8. PaymentSuccess ও PaymentCancel — মোবাইল ফিক্স**
- Card-এ `mx-4` margin নিশ্চিত করা (ইতোমধ্যে `p-4` আছে, তবুও চেক)

### ফাইল তালিকা
- `src/pages/PlayBooking.tsx`
- `src/pages/BirthdayEvents.tsx`
- `src/pages/NotFound.tsx`
- `src/components/events/EventPackages.tsx`
- `src/components/events/EventsGallery.tsx`
- `src/components/events/EventBookingForm.tsx`
- `src/components/ContactForm.tsx`
- `src/components/GoogleMap.tsx`

### টেকনিক্যাল নোট
- শুধুমাত্র Tailwind ক্লাস পরিবর্তন — কোনো লজিক পরিবর্তন নেই
- বিদ্যমান ডিজাইন প্যাটার্ন (`py-16 sm:py-20 lg:py-24`, `px-4 sm:px-6`) ফলো করা হবে
- মোট ~8 টি ফাইলে ছোট ছোট CSS ক্লাস পরিবর্তন

