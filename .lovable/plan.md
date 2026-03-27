

## Plan: Translate All Bengali Text to English

### Scope

~1450 Bengali text instances across **28 files** in 4 categories:

### Files to Update

**Admin Pages (13 files):**
- `AdminPromotions.tsx` — form labels, select options, buttons, toasts
- `AdminAboutContact.tsx` — descriptions, toasts, labels
- `AdminSocialMedia.tsx` — labels, toasts, statuses
- `AdminSmsCampaigns.tsx` — labels, toasts, statuses
- `AdminFoodOrders.tsx` — labels, statuses, toasts
- `AdminFoodPOS.tsx` — labels, buttons, toasts
- `AdminFoodSales.tsx` — labels, toasts
- `AdminCoupons.tsx` — labels, toasts
- `AdminSettings.tsx` — labels, descriptions, toasts
- `AdminExpenses.tsx` — labels, toasts
- `AdminEvents.tsx` — labels, toasts
- `AdminMemberships.tsx` — labels, toasts
- `AdminMembershipPackages.tsx` — labels, toasts

**Components (9 files):**
- `Footer.tsx` — Bengali brand name references
- `SEOHead.tsx` — entire `bn` section of SEO meta, Bengali in `en` section
- `NotificationTemplateEditor.tsx` — Bengali SMS templates, preview data
- `BookingPrintTicket.tsx` — bilingual label objects (keep only English)
- `ManualBookingForm.tsx` — labels, toasts
- `PlayFAQ.tsx` — if any Bengali remains
- `PricingSection.tsx` — if any Bengali remains
- `BookingSection.tsx` — if any Bengali remains
- `ContactForm.tsx` — if any Bengali remains

**Hooks (6 files):**
- `useSendSMS.ts` — SMS message templates, toast messages
- `usePromotions.ts` — toast messages
- `useSocialMediaPosts.ts` — toast messages
- `useSmsCampaigns.ts` — toast messages
- `useLeads.ts` — toast messages
- `usePayroll.ts` — toast messages

**Edge Functions (3 files):**
- `payment-webhook/index.ts` — Bengali SMS text
- `ticket-payment-notify/index.ts` — Bengali SMS text
- `food-payment-notify/index.ts` — Bengali SMS text

### Approach
- Replace all Bengali strings with English equivalents
- Remove bilingual objects (e.g., `{ en: '...', bn: '...' }`) — keep only the English value
- Remove the entire `bn` section from `SEOHead.tsx`
- Keep `৳` (BDT currency symbol) as-is
- No structural/logic changes — text-only replacements

