

## Plan: Package Pricing Editable করা

### পরিবর্তন সারসংক্ষেপ

বর্তমানে Package Pricing কার্ড শুধু static text দেখায়। এটিকে editable input fields-এ রূপান্তর করা হবে এবং `useSettings` hook-এ package pricing state ও save logic যোগ হবে।

### ফাইল পরিবর্তন

#### 1. `src/hooks/useSettings.ts`
- নতুন `PackagePricing` interface যোগ:
  ```
  familyRegular, familyOffer, fullBoard, extraGuardian, rideZoneRegular, rideZoneOffer
  ```
- Default values সেট (500, 350, 800, 150, 1350, 500)
- `packagePricing` state যোগ
- `loadSettings`-এ `package_pricing` key parse করে state-এ সেট
- `savePackagePricing` function যোগ — `saveSetting('package_pricing', ...)` কল করবে
- `savePricing`-এর সাথে `savePackagePricing`-ও কল হবে যাতে একটি Save বাটনেই সব সেভ হয়
- Return object-এ `packagePricing`, `setPackagePricing` expose

#### 2. `src/pages/admin/AdminSettings.tsx`
- `useSettings` থেকে `packagePricing`, `setPackagePricing` import
- Package Pricing কার্ডের static text রিপ্লেস করে editable form:
  - **Family Package** section: Regular (৳), Eid/Offer (৳)
  - **Full Board** section: Price (৳)
  - **Extra Guardian** section: Price (৳)
  - **Ride Zone Package** section: Regular (৳), Eid/Offer (৳)
- সব ফিল্ড `৳` prefix সহ number input
- `handleSavePricing` কলে package pricing-ও সেভ হবে

### UI Layout
```text
┌─ Package Pricing ─────────────────────────┐
│ Family Package                            │
│ [Regular ৳500]  [Eid/Offer ৳350]         │
│                                           │
│ Full Board      Extra Guardian            │
│ [৳800]          [৳150]                   │
│                                           │
│ Ride Zone Package                         │
│ [Regular ৳1350] [Eid/Offer ৳500]         │
└───────────────────────────────────────────┘
```

