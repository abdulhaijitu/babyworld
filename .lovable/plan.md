

## পরিকল্পনা: Events সাবমেনু রিঅর্ডার + Events ও Event Bookings মার্জ

### সমস্যা
1. সাইডবারে EVENTS গ্রুপের সিরিয়াল ভুল আছে
2. Events এবং Event Bookings দুটি আলাদা পেজ কিন্তু একই ডেটা দেখায় — মার্জ করা দরকার

### পরিবর্তন

**১. সাইডবার রিঅর্ডার (`AdminSidebar.tsx`)**
EVENTS গ্রুপের children ক্রম পরিবর্তন:
```
Event Packages → Events → Event Calendar
```
Event Bookings সাবমেনু সম্পূর্ণ বাদ।

**২. রাউট সরানো (`App.tsx`)**
- `/admin/event-bookings` রাউট মুছে ফেলা
- AdminEventBookings import বাদ দেওয়া

**৩. AdminEventBookings.tsx রাখা বা মোছা**
- ফাইলটি রাখার দরকার নেই কারণ AdminEvents.tsx-এ ইতিমধ্যে বুকিং তৈরি, স্ট্যাটাস আপডেট, পেমেন্ট ট্র্যাকিং সব আছে

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | EVENTS children রিঅর্ডার, Event Bookings বাদ |
| `src/App.tsx` | event-bookings রাউট ও import বাদ |
| `src/pages/admin/AdminEventBookings.tsx` | মুছে ফেলা |

