

## Duration ফিল্ড পরিবর্তন — ঘণ্টা → মিনিট

### পরিবর্তন: `src/pages/admin/AdminRides.tsx`

1. **Form state**: `duration_hours` → `duration_minutes` (number, default `0`)
2. **Form label**: "Duration (hr)" → "Duration (minutes)"
3. **Input**: `step={0.5}` → `step={1}`, min=0
4. **Save (insert/update)**: সরাসরি `formData.duration_minutes` পাঠাবে, আর `Math.round(hours*60)` কনভার্শন দরকার নেই
5. **Edit load**: সরাসরি `ride.duration_minutes || 0` সেট হবে, `/60` কনভার্শন দরকার নেই

শুধু একটি ফাইলে ৫-৬ লাইন পরিবর্তন।

