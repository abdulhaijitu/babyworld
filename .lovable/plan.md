

## পরিকল্পনা: সকল মোডাল ও UI থেকে বাংলা অপশন বাদ দেওয়া

### প্রভাবিত ফাইলসমূহ (৮টি)

| ফাইল | বাংলা কনটেন্ট |
|---|---|
| `AdminSettings.tsx` | `nameBn`, `addressBn` ইনপুট ফিল্ড |
| `AdminExpenses.tsx` | `labelBn` — categories ও payment methods |
| `AdminUsers.tsx` | `labelBn` — role config |
| `AdminRides.tsx` | `name_bn` ইনপুট ফিল্ড ও ডিসপ্লে |
| `AdminFoodSales.tsx` | `name_bn` ইনপুট ফিল্ড |
| `AdminEvents.tsx` | `nameBn` — event packages |
| `NotificationTemplateEditor.tsx` | `labelBn` — template types |
| `AdminSidebar.tsx` | `labelBn` — menu items |
| `MobileBottomNav.tsx` | `labelBn` — nav items |
| `SocialLinks.tsx` | `nameBn` — social link names |

### পরিবর্তন

প্রতিটি ফাইলে:
1. **`labelBn` / `nameBn` / `name_bn` / `addressBn` প্রপার্টি মুছুন** — ইন্টারফেস ও ডেটা অবজেক্ট থেকে
2. **"Name (Bangla)" / "Name (Bengali)" ইনপুট ফিল্ড সম্পূর্ণ রিমুভ** — AdminSettings, AdminRides, AdminFoodSales
3. **`labelBn` রেফারেন্স রিমুভ** — শুধু `label` ব্যবহার করা হবে
4. **MobileBottomNav**: `labelBn` বাদ, শুধু `labelEn` → `label` রাখা হবে
5. **AdminSidebar**: `labelBn` বাদ, শুধু `label` ব্যবহার

> **নোট**: ডাটাবেসে `name_bn` কলাম থাকলে সেটা রাখা যাবে (backward compatible), শুধু UI থেকে ইনপুট/ডিসপ্লে বাদ দেওয়া হবে।

