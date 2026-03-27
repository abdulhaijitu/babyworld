

## পরিকল্পনা: Settings পেজ ৭-ট্যাব রিস্ট্রাকচার

### বর্তমান অবস্থা
Settings পেজে ৪টি ট্যাব আছে: Pricing, Business, Notifications, General

### নতুন ট্যাব স্ট্রাকচার (৭টি)
1. **General** — Theme (Dark Mode) + Security (Change Password) — বর্তমান কোড থেকে
2. **Business** — Business Information — বর্তমান কোড থেকে
3. **Pricing** — Hourly Play + Event Package + Package Pricing — বর্তমান কোড থেকে
4. **Notifications** — SMS/WhatsApp চ্যানেল টগল + Template Editor — বর্তমান কোড থেকে
5. **Email Configure** (নতুন) — Email notification সেটিংস (SMTP বা email provider কনফিগারেশন, email templates preview)
6. **SMS Gateway** (নতুন) — SMS API কনফিগারেশন (API Key, Sender ID, API URL ফিল্ড) — বর্তমানে edge function-এ হার্ডকোড করা আছে, এখন settings থেকে কনফিগার করা যাবে
7. **Payment Gateway** (নতুন) — UddoktaPay কনফিগারেশন (API mode: Sandbox/Live, API URL display, স্ট্যাটাস ইন্ডিকেটর)

### পরিবর্তনসমূহ

**ফাইল: `src/pages/admin/AdminSettings.tsx`**
- TabsList কে ৭টি ট্যাবে আপডেট (স্ক্রলেবল হবে মোবাইলে)
- ডিফল্ট ট্যাব `general` এ পরিবর্তন
- ৩টি নতুন `TabsContent` যোগ

**নতুন ট্যাব কন্টেন্ট:**

#### Email Configure ট্যাব
- Email notification enable/disable toggle
- Email provider info card (বর্তমানে কোনো SMTP সেট নেই তাই "Not Configured" স্ট্যাটাস দেখাবে)
- ভবিষ্যতে SMTP সেটআপ করার জন্য placeholder

#### SMS Gateway ট্যাব
- SMS Provider Name (e.g. ReveCloud/Khudebarta)
- API Key ফিল্ড (masked, শুধু শেষ ৪ ক্যারেক্টার দেখাবে — এটি settings টেবিলে সেভ হবে)
- Sender ID ফিল্ড
- API URL ফিল্ড
- Connection Test বাটন
- স্ট্যাটাস ব্যাজ (Configured/Not Configured)
- `settings` টেবিলে `sms_gateway` কী-তে JSON হিসেবে সেভ হবে

#### Payment Gateway ট্যাব
- Gateway Name: UddoktaPay (readonly)
- Mode সিলেক্ট: Sandbox / Live
- API URL display
- Connection status indicator
- `settings` টেবিলে `payment_gateway` কী-তে JSON হিসেবে সেভ হবে

**হুক আপডেট: `src/hooks/useSettings.ts`**
- `smsGateway` ও `paymentGateway` state যোগ
- `saveSmsGateway()` ও `savePaymentGateway()` ফাংশন যোগ
- settings লোডে নতুন কী-গুলো পড়া

### গুরুত্বপূর্ণ নোট
- SMS API Key ও Payment API Key সিক্রেট হিসেবে edge function-এ থাকবে, settings-এ শুধু non-sensitive config (provider name, sender ID, mode, API URL) সেভ হবে
- কোনো ডাটাবেস মাইগ্রেশন লাগবে না — `settings` টেবিলে নতুন key-value পেয়ার ইনসার্ট হবে

