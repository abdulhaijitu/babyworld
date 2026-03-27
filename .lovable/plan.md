

## পরিকল্পনা: Settings ট্যাবগুলো সাইডবার সাবমেনু হিসেবে

### কী হবে
বর্তমানে Settings একটি সিঙ্গেল পেজে ৭টি ট্যাব আছে। এগুলো সাইডবারে Settings-এর সাবমেনু হিসেবে দেখাবে, প্রতিটির জন্য আলাদা রাউট থাকবে।

### পরিবর্তনসমূহ

**১. সাইডবার আপডেট (`src/components/admin/AdminSidebar.tsx`)**

`settings` আইটেমে `children` যোগ:
```
settings → children:
  - General         → /admin/settings/general
  - Business        → /admin/settings/business
  - Pricing         → /admin/settings/pricing
  - Notifications   → /admin/settings/notifications
  - Email Configure → /admin/settings/email
  - SMS Gateway     → /admin/settings/sms
  - Payment Gateway → /admin/settings/payment
```

**২. ৭টি নতুন পেজ কম্পোনেন্ট তৈরি**

বর্তমান `AdminSettings.tsx` থেকে প্রতিটি `TabsContent`-এর কন্টেন্ট আলাদা ফাইলে সরানো হবে:
- `src/pages/admin/settings/SettingsGeneral.tsx`
- `src/pages/admin/settings/SettingsBusiness.tsx`
- `src/pages/admin/settings/SettingsPricing.tsx`
- `src/pages/admin/settings/SettingsNotifications.tsx`
- `src/pages/admin/settings/SettingsEmail.tsx`
- `src/pages/admin/settings/SettingsSms.tsx`
- `src/pages/admin/settings/SettingsPayment.tsx`

প্রতিটি পেজ `useSettings()` হুক ব্যবহার করবে এবং নিজের সেকশনের ফর্ম/কন্টেন্ট রেন্ডার করবে।

**৩. রাউটিং আপডেট (`src/App.tsx`)**

```
<Route path="settings" element={<Navigate to="/admin/settings/general" />} />
<Route path="settings/general" element={<SettingsGeneral />} />
<Route path="settings/business" element={<SettingsBusiness />} />
<Route path="settings/pricing" element={<SettingsPricing />} />
<Route path="settings/notifications" element={<SettingsNotifications />} />
<Route path="settings/email" element={<SettingsEmail />} />
<Route path="settings/sms" element={<SettingsSms />} />
<Route path="settings/payment" element={<SettingsPayment />} />
```

**৪. পুরানো `AdminSettings.tsx` সরলীকরণ**

ফাইলটি `/admin/settings`-এ redirect করবে `/admin/settings/general`-এ, অথবা মুছে ফেলা হবে।

### টেকনিক্যাল নোট
- `useSettings` হুক শেয়ার্ড থাকবে — প্রতিটি পেজ থেকে প্রয়োজনীয় state ও ফাংশন ব্যবহার করবে
- Tabs কম্পোনেন্ট আর লাগবে না — প্রতিটি পেজ সরাসরি Card-ভিত্তিক লেআউট হবে
- সাইডবারে আইকন: Settings (General), Building (Business), Banknote (Pricing), Bell (Notifications), Mail (Email), SendHorizonal (SMS), CreditCard (Payment)

