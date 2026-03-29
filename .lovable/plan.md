

## স্টিকি নিউজবার — প্ল্যান

### কী তৈরি হবে
নেভবারের ঠিক নিচে একটি স্ক্রলিং/টিকার স্টাইলের নিউজবার যেখানে অ্যাডমিন প্যানেল থেকে নিউজ আইটেম যোগ/এডিট/ডিলিট/অন-অফ করা যাবে।

### ব্যাকএন্ড
- **`settings` টেবিল ব্যবহার** (নতুন টেবিল দরকার নেই)
- Key: `news_ticker`, Category: `frontend`
- Value (JSONB):
```json
{
  "enabled": true,
  "speed": "normal",
  "items": [
    { "id": "1", "text": "🎉 আজ ৫০% ছাড়!", "link": "/play-booking", "active": true },
    { "id": "2", "text": "📞 কল করুন: 09606990128", "link": null, "active": true }
  ]
}
```

### ফ্রন্টএন্ড কম্পোনেন্ট

**১. `src/components/NewsBar.tsx`** — নতুন কম্পোনেন্ট
- `settings` থেকে `news_ticker` ফেচ করে
- CSS marquee/ticker animation দিয়ে নিউজ স্ক্রল করবে
- Navbar-এর নিচে sticky position (`sticky top-[64px]` ডেস্কটপে, `top-[48px]` মোবাইলে)
- Close বাটন থাকবে (সেশনে হাইড)
- `enabled: false` হলে রেন্ডার হবে না
- লিংক থাকলে ক্লিকেবল হবে

**২. সব পাবলিক পেইজে যোগ** (6টি ফাইল)
- `Index.tsx`, `PlayBooking.tsx`, `BirthdayEvents.tsx`, `Contact.tsx`, `Gallery.tsx` — প্রতিটিতে `<Navbar />` এর পরে `<NewsBar />` যোগ

**৩. `src/pages/admin/AdminHomepage.tsx`** — নতুন ট্যাব যোগ
- "News Ticker" ট্যাব যোগ করা হবে existing Slides ও Cards ট্যাবের পাশে
- ফিচার:
  - Enable/Disable টগল
  - নিউজ আইটেম লিস্ট (টেক্সট, লিংক, active টগল)
  - আইটেম যোগ/এডিট/ডিলিট
  - ড্র্যাগ বা সর্ট অর্ডার
  - সেভ বাটন → `settings` টেবিলে আপডেট

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/NewsBar.tsx` | নতুন তৈরি |
| `src/pages/admin/AdminHomepage.tsx` | News Ticker ট্যাব যোগ |
| `src/pages/Index.tsx` | NewsBar import ও যোগ |
| `src/pages/PlayBooking.tsx` | NewsBar যোগ |
| `src/pages/BirthdayEvents.tsx` | NewsBar যোগ |
| `src/pages/Contact.tsx` | NewsBar যোগ |
| `src/pages/Gallery.tsx` | NewsBar যোগ |

### কোনো DB মাইগ্রেশন লাগবে না
বিদ্যমান `settings` টেবিলেই JSONB হিসেবে সব ডেটা সংরক্ষণ হবে।

