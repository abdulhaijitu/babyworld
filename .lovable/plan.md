

## "Eid" → "Offer" লেবেল পরিবর্তন

### পরিবর্তন: `src/components/PricingSection.tsx`

দুই জায়গায় "Eid" টেক্সট "Offer" দিয়ে রিপ্লেস:

1. **Line 130** — Ride Zone Package কার্ডে:
   - `Eid Offer:` → `Offer:`

2. **Line 165** — Individual Ride Prices-এ:
   - `Eid: ৳{ride.offer_price}` → `Offer: ৳{ride.offer_price}`

### পরিবর্তন: `src/pages/admin/settings/SettingsPricing.tsx`

Admin pricing settings-এও লেবেল আপডেট:

1. **Line 78** — Family Package: `'Eid/Offer'` → `'Offer'`
2. **Line 105** — Ride Zone Package: `'Eid/Offer'` → `'Offer'`

মোট ৪টি লাইনে টেক্সট পরিবর্তন, ২টি ফাইলে।

