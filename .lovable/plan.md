

## SEO ও Social অডিট রিপোর্ট ও ফিক্স প্ল্যান

### সমস্যা চিহ্নিত

| # | সমস্যা | তীব্রতা |
|---|--------|--------|
| 1 | `index.html`-এ OG image = generic Lovable placeholder (`lovable.dev/opengraph-image-p98pqg.png`) | High |
| 2 | `SEOHead.tsx`-এ OG images অস্তিত্বহীন ফাইলে পয়েন্ট করে (`/og-home.jpg` etc.) | High |
| 3 | `robots.txt`-এ `Sitemap:` directive নেই | Medium |
| 4 | কোনো `sitemap.xml` নেই | Medium |
| 5 | Gallery পেইজে proper OG tags, canonical URL, structured data নেই | Medium |
| 6 | JSON-LD structured data-তে Instagram ও TikTok `sameAs` লিঙ্ক নেই | Low |
| 7 | `index.html`-এর static meta tags ও `SEOHead`-এর dynamic tags-এ conflict/duplicate | Low |
| 8 | Admin routes indexable (crawlers `/admin/*` crawl করতে পারে) | Low |

### ফিক্স প্ল্যান (৪টি ফাইল)

**১. `index.html` — Clean up static fallback meta**
- OG image-কে favicon.png-তে পয়েন্ট করো (fallback হিসেবে), অথবা remove করো কারণ `SEOHead` override করে
- Twitter image-ও একই ফিক্স
- Static title/description রাখো কিন্তু Lovable placeholder image সরাও

**২. `src/components/SEOHead.tsx` — ফিক্স OG images + Gallery support + sameAs**
- `ogImages` map-এর ভ্যালু favicon.png বা actual site URL-এ পয়েন্ট করো (কোনো `/og-home.jpg` ফাইল exist করে না)
- `page` prop-এ `"gallery"` type যোগ করো, সংশ্লিষ্ট SEO data সহ
- JSON-LD `sameAs`-এ `SOCIAL_LINKS.instagram` ও `SOCIAL_LINKS.tiktok` যোগ করো

**৩. `src/pages/Gallery.tsx` — SEOHead ব্যবহার করো**
- Inline `<Helmet>` সরিয়ে `<SEOHead page="gallery" />` ব্যবহার করো

**৪. `public/robots.txt` — Sitemap + Admin disallow**
- `Sitemap: https://babyworld.lovable.app/sitemap.xml` যোগ করো
- `Disallow: /admin` যোগ করো admin pages block করতে

**৫. `public/sitemap.xml` — নতুন ফাইল তৈরি**
- Static sitemap: `/`, `/play-booking`, `/birthday-events`, `/contact`, `/gallery`
- `lastmod`, `changefreq`, `priority` সহ

