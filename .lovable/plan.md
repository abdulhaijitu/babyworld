

## পরিকল্পনা: `/admin/ticketing` পেইজ সম্পূর্ণ অডিট ও ফিক্স

### সমস্যা চিহ্নিত

#### বাগ/এরর
1. **Console Warning**: `Badge` কম্পোনেন্টে `ref` পাস হচ্ছে কিন্তু Badge `forwardRef` ব্যবহার করে না — `getStatusBadge` ফাংশনে Badge ব্যবহার হচ্ছে, সমস্যা সম্ভবত টেবিলের ভিতরে
2. **Legacy Create Dialog**: `createOpen`, `creating`, `newTicket`, `handleCreateTicket`, `generateTicketNumber`, `timeSlots` — এগুলো সব অব্যবহৃত কোড (পুরনো create dialog), CounterTicketForm ইতিমধ্যে ব্যবহৃত হচ্ছে ট্যাবে। Dead code ক্লিনআপ দরকার
3. **Stats cards grid**: 3 কলাম কিন্তু `insideCount` স্ট্যাট দেখানো হচ্ছে না — "Inside Venue" একটি গুরুত্বপূর্ণ মেট্রিক যেটা মিসিং
4. **Indentation সমস্যা**: TabsContent "list" এর ভেতরে stats cards ও table card ভুল ইন্ডেন্টেশনে আছে
5. **`payment_type` ও `payment_status` টেবিলে নেই**: টিকেট তৈরি হচ্ছে payment info সহ কিন্তু লিস্ট ভিউতে payment status দেখা যাচ্ছে না
6. **`in_time`/`out_time` টেবিলে নেই**: কাউন্টার টিকেটে in/out time সেট হয় কিন্তু লিস্টে দেখা যাচ্ছে না

#### UX উন্নতি
7. **Stats cards**: 4 টি কার্ড হওয়া উচিত — Active, Today, Inside Venue, Used — 4 কলাম গ্রিডে
8. **টেবিলে Payment column** যোগ করা: Cash/Online ও Paid/Unpaid ব্যাজ
9. **টেবিলে Time column** যোগ করা: In ও Out time দেখানো
10. **মোবাইলে টেবিল responsiveness**: অনেক কলাম আছে, ছোট স্ক্রিনে কিছু কলাম লুকানো দরকার
11. **Pagination নেই**: বড় ডেটাসেটে সমস্যা হবে — সিম্পল "Load more" বা pagination যোগ করা
12. **No ticket count badge** ফিল্টার রেজাল্টে: কতটি টিকেট দেখাচ্ছে সেটা জানানো

### পরিবর্তনসমূহ

#### ফাইল: `src/pages/admin/AdminTicketing.tsx`
- **Dead code মুছুন**: `createOpen`, `creating`, `newTicket`, `handleCreateTicket`, `generateTicketNumber`, `timeSlots`, এবং সম্পর্কিত imports (`DialogTrigger`, `Label`, `Textarea` ইত্যাদি)
- **Stats cards**: 4-কলাম গ্রিড করুন — Active (সবুজ), Today's, Inside Venue (নীল, insideCount ব্যবহার করে), Used
- **TicketType interface আপডেট**: `payment_type`, `payment_status`, `in_time`, `out_time` যোগ
- **টেবিল কলাম আপডেট**:
  - "Time" কলাম যোগ (in_time → out_time দেখাবে)
  - "Payment" কলাম যোগ (Cash/Online ব্যাজ + Paid/Unpaid ব্যাজ)
  - "Source" ও "Discount" কলাম মোবাইলে `hidden md:table-cell` দিয়ে লুকান
- **Filtered count ব্যাজ** টেবিল হেডারে দেখান
- **কোড ইন্ডেন্টেশন ঠিক করুন** (TabsContent এর ভেতরে)
- **Pagination**: Simple "Showing X of Y" + লিমিট 50 টিকেট প্রতি পেইজ + "Show more" বাটন

#### ফাইল: `src/components/admin/ticketing/TicketSuccessDialog.tsx`
- কোনো পরিবর্তন নেই, এটি ঠিক আছে

#### ফাইল: `src/components/admin/ticketing/CounterTicketForm.tsx`
- কোনো পরিবর্তন নেই, এটি ঠিক আছে

### সারাংশ
মূলত `AdminTicketing.tsx` ফাইলে ক্লিনআপ ও UI উন্নতি — dead code মুছুন, stats card উন্নতি, টেবিলে payment/time তথ্য যোগ, এবং responsive design উন্নতি।

