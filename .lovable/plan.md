

## হিরো সেকশন রিডিজাইন

### বর্তমান অবস্থা
এখন হিরো সেকশনে 2-কলাম লেআউট আছে: বামে টেক্সট কন্টেন্ট, ডানে ফ্লোটিং ইমেজ গ্যালারি। ডানের কলাম শুধু ডেস্কটপে দেখায়।

### নতুন লেআউট ডিজাইন

```text
┌─────────────────────────────────────────────────────────────┐
│                        Hero Section                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │                          │  │     🎁 Offer Card        │ │
│  │   Image Slider           │  │  Gradient bg, discount   │ │
│  │   (auto-play carousel)   │  │  info, CTA button        │ │
│  │   with dots/arrows       │  │                          │ │
│  │                          │  ├──────────────────────────┤ │
│  │   playground-kids.jpg    │  │     📅 Upcoming Event    │ │
│  │   mascot-kids.jpg        │  │  Event name, date,       │ │
│  │   carousel-rides.jpg     │  │  countdown/badge, CTA    │ │
│  │   arcade-games.jpg       │  │                          │ │
│  │                          │  │                          │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│  (col-span ~60%)               (col-span ~40%)              │
└─────────────────────────────────────────────────────────────┘
```

**মোবাইলে**: স্ট্যাক হবে — Slider উপরে, তারপর Offer ও Event কার্ড নিচে।

### বিস্তারিত পরিকল্পনা

**1. HeroSection.tsx সম্পূর্ণ রিরাইট**
- 2-কলাম গ্রিড: `lg:grid-cols-[3fr_2fr]`
- **Column 1 — Image Slider**:
  - Embla Carousel (shadcn `Carousel` কম্পোনেন্ট ব্যবহার) দিয়ে অটো-প্লে ইমেজ স্লাইডার
  - বিদ্যমান 4টি ইমেজ ব্যবহার: `playground-kids`, `mascot-kids`, `carousel-rides`, `arcade-games`
  - ডট ইন্ডিকেটর ও নেভিগেশন অ্যারো
  - Rounded corners, subtle shadow
  - Auto-play every 4 seconds

- **Column 2 — দুই সারি**:
  - **Row 1 — Offer Card**: Gradient background (primary→secondary), অফার টাইটেল, ডিসকাউন্ট তথ্য, "Book Now" CTA বাটন। বিদ্যমান `PromoBanner` এর কন্টেন্ট এখানে ইন্টিগ্রেট।
  - **Row 2 — Upcoming Event Card**: ইভেন্ট নাম, তারিখ, ছোট ডেসক্রিপশন, "Learn More" CTA। `new-year-event.jpg` বা `birthday-party.jpg` ব্যাকগ্রাউন্ডে।

**2. PromoBanner সরানো**
- `Index.tsx` থেকে `<PromoBanner />` রিমুভ — কারণ অফার তথ্য এখন হিরো সেকশনেই আছে।

**3. Translation keys যোগ**
- `translations.ts`-এ নতুন keys: `hero.offer.title`, `hero.offer.description`, `hero.offer.cta`, `hero.upcoming.title`, `hero.upcoming.date`, `hero.upcoming.description`, `hero.upcoming.cta`

**4. অ্যানিমেশন**
- Framer Motion fade-in stagger — স্লাইডার ও কার্ড আলাদা আলাদা animate হবে
- কার্ডে subtle hover scale effect

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/components/HeroSection.tsx` | সম্পূর্ণ রিরাইট — Slider + Offer + Event লেআউট |
| `src/pages/Index.tsx` | `PromoBanner` ইমপোর্ট ও ব্যবহার সরানো |
| `src/lib/translations.ts` | নতুন hero offer ও upcoming event keys যোগ |

