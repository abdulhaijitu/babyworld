

## PWA সেটআপ প্ল্যান

### সতর্কতা
PWA ফিচার (অফলাইন সাপোর্ট, ইনস্টল প্রম্পট) শুধু published/deployed ভার্সনে কাজ করবে — Lovable editor preview-তে কাজ করবে না।

### পরিবর্তন

**১. `public/manifest.json` তৈরি**
- `name`: "Baby World"
- `short_name`: "BabyWorld"
- `display`: "standalone"
- `theme_color` ও `background_color`
- Icons: `/favicon.png` কে 192x192 ও 512x512 আইকন হিসেবে ব্যবহার (existing `favicon.png`)

**২. `index.html` — manifest লিঙ্ক যোগ**
- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color">` যোগ

**৩. `vite.config.ts` — `vite-plugin-pwa` যোগ**
- `registerType: "autoUpdate"`
- `devOptions: { enabled: false }` (preview-তে সমস্যা এড়াতে)
- `navigateFallbackDenylist: [/^\/~oauth/]`
- manifest config icons সহ

**৪. `src/main.tsx` — iframe/preview guard**
- Preview host বা iframe-এ থাকলে service worker unregister করবে
- এতে Lovable editor-এ stale cache সমস্যা হবে না

### ডিপেন্ডেন্সি
- `vite-plugin-pwa` install

### আইকন
- বিদ্যমান `/favicon.png` ফাইলকেই PWA আইকন হিসেবে ব্যবহার করা হবে (192x192, 512x512 purpose: "any maskable")

