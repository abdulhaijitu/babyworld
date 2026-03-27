

## পরিকল্পনা: Frontend কন্ট্রোল সিস্টেম — Backend ↔ Frontend রিলেশন ডিজাইন

### বর্তমান অবস্থা

```text
Admin Frontend Menu
├── Homepage (ট্যাবড: Slides + Cards) → /admin/homepage
├── Hero Slides → /admin/hero-slides (স্ট্যান্ডঅ্যালোন)
└── Hero Cards → /admin/hero-cards (স্ট্যান্ডঅ্যালোন)
```

**সমস্যা:** Homepage পেজ ইতিমধ্যে Slides ও Cards এম্বেড করে দেখায়, আবার আলাদা পেজেও একই কম্পোনেন্ট আছে — এটা ডুপ্লিকেশন। এছাড়া, ওয়েবসাইটের অন্যান্য সেকশন (About, Video, Testimonials, Trust, Contact info) কন্ট্রোল করার কোনো ব্যবস্থা নেই।

### প্রস্তাবিত ডিজাইন

```text
Admin Frontend Menu (Accounts-এর পরে)
├── Homepage → /admin/homepage
│   ├── Tab: Hero Slider (hero_slides টেবিল)
│   └── Tab: Offer & Event Cards (hero_cards টেবিল)
├── About & Contact → /admin/about-contact [নতুন]
│   ├── Tab: About Section (settings টেবিল, key: 'about_content')
│   ├── Tab: Contact Info (settings টেবিল, key: 'contact_info')
│   └── Tab: Social Links (settings টেবিল, key: 'social_links')
└── SEO & Branding → /admin/seo-branding [নতুন]
    ├── Tab: SEO Meta Tags (settings টেবিল, key: 'seo_meta')
    └── Tab: Branding (settings টেবিল, key: 'site_branding')
```

### ব্যাকএন্ড ↔ ফ্রন্টএন্ড ডেটা ফ্লো

```text
┌─────────────────────────────────────┐
│         ADMIN (Backend Control)     │
│                                     │
│  hero_slides table ──────────────── │──→ HeroSection.tsx (Slider)
│  hero_cards table ───────────────── │──→ HeroSection.tsx (Offer/Event Cards)
│  settings['about_content'] ──────── │──→ AboutSection.tsx
│  settings['contact_info'] ────────  │──→ ContactSection.tsx / Footer.tsx
│  settings['social_links'] ────────  │──→ SocialLinks.tsx / Footer.tsx
│  settings['seo_meta'] ───────────── │──→ SEOHead.tsx
│  settings['site_branding'] ──────── │──→ Navbar.tsx / Footer.tsx
└─────────────────────────────────────┘
```

### পরিবর্তন তালিকা

| ফাইল | কাজ |
|------|------|
| `AdminSidebar.tsx` | Frontend সাবমেনু আপডেট — Hero Slides ও Hero Cards সরিয়ে Homepage, About & Contact, SEO & Branding যোগ |
| `AdminAboutContact.tsx` [নতুন] | About text, Contact info, Social links এডিট করার ট্যাবড ইন্টারফেস — settings টেবিল ব্যবহার করবে |
| `AdminSeoBranding.tsx` [নতুন] | SEO meta ও branding সেটিংস এডিট করার ইন্টারফেস |
| `App.tsx` | নতুন রাউট যোগ: `/admin/about-contact`, `/admin/seo-branding`; পুরাতন `/admin/hero-slides` ও `/admin/hero-cards` রাউট রিমুভ |
| `AboutSection.tsx` | settings থেকে ডাইনামিক কন্টেন্ট লোড করার লজিক যোগ |
| `ContactSection.tsx` / `Footer.tsx` | settings থেকে ডাইনামিক কন্ট্যাক্ট ইনফো ও সোশ্যাল লিংক লোড |
| `SEOHead.tsx` | settings থেকে ডাইনামিক মেটা ট্যাগ লোড |

### কারিগরি বিবরণ

- **কোনো নতুন টেবিল লাগবে না** — বিদ্যমান `settings` টেবিল (key-value JSONB) ব্যবহার হবে নতুন কন্টেন্ট স্টোরের জন্য
- `hero_slides` ও `hero_cards` টেবিল যেভাবে আছে সেভাবেই থাকবে
- Homepage পেজ (`/admin/homepage`) এম্বেডেড আর্কিটেকচার বজায় রাখবে
- স্ট্যান্ডঅ্যালোন Hero Slides ও Hero Cards রাউট বাদ যাবে কারণ Homepage-এ ইতিমধ্যে আছে
- সব নতুন পেজ `requiredRoles: ['super_admin', 'admin']` থাকবে
- settings টেবিলে RLS ইতিমধ্যে আছে (admin write, public read)

