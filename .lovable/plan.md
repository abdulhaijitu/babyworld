

## পরিকল্পনা: Events পেজ সিম্পলিফাই

### পরিবর্তন (`src/pages/admin/AdminEvents.tsx`)

1. **Bookings ট্যাব সরানো** — `Tabs` কম্পোনেন্ট, `TabsList`, `TabsTrigger`, `TabsContent` সব বাদ। শুধু Events কন্টেন্ট সরাসরি থাকবে। `BookingsListTab` import বাদ।
2. **Event Packages কার্ড সরানো** — লাইন 390-413 এর "Event Packages Info" কার্ড ব্লক মুছে ফেলা।
3. **হেডার আপডেট** — "Events & Bookings" → "Events", সাবটাইটেল থেকে "& play bookings" বাদ।

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminEvents.tsx` | Tabs স্ট্রাকচার সরানো, Event Packages কার্ড সরানো, হেডার আপডেট |

