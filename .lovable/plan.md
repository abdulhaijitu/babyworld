

## Fix: + New Member মোডাল স্ক্রলিং

### সমস্যা
`DialogContent`-এ `max-h` ও `overflow-y-auto` নেই, তাই ছোট স্ক্রিনে কন্টেন্ট কাটা যায়।

### সমাধান — `src/pages/admin/AdminMemberships.tsx`
Line 272-এ `DialogContent` ক্লাস আপডেট:
```
<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
```

একটি লাইন পরিবর্তন, একটি ফাইল।

