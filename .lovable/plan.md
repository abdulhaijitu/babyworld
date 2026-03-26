

## Plan: Time Slots ট্যাব রিমুভ

### পরিবর্তন

Time Slots ট্যাব সম্পূর্ণ রিমুভ করা হবে। প্লেগ্রাউন্ড slot-based নয় — টিকিট কাটার সময় থেকে নির্ধারিত সময় (১-২ ঘন্টা) গণনা হবে।

### ফাইল পরিবর্তন

**`src/pages/admin/AdminSettings.tsx`:**
- `TabsTrigger value="timeslots"` রিমুভ (line ~134-136)
- `TabsContent value="timeslots"` পুরো ব্লক রিমুভ (line ~314-371)
- `enabledSlotsCount` variable রিমুভ (যদি থাকে)
- `handleSaveTimeSlots` function রিমুভ
- `timeSlots`, `toggleTimeSlot`, `saveTimeSlots` imports from `useSettings` রিমুভ

**`src/hooks/useSettings.ts`:**
- `timeSlots`, `setTimeSlots`, `toggleTimeSlot`, `saveTimeSlots`, `defaultTimeSlots` কোড রাখা যাবে (অন্য জায়গায় ব্যবহার হতে পারে) তবে settings UI থেকে সরানো হবে

**Note:** `Clock` icon import রাখা হবে কারণ অন্য জায়গায় ব্যবহার হতে পারে।

