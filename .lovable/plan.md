

## পরিকল্পনা: MARKETING মেনু যোগ করা

### পরিবর্তন (`src/components/admin/AdminSidebar.tsx`)

EVENTS গ্রুপের পরে নতুন `marketing` গ্রুপ মেনু যোগ:

```tsx
{ id: 'marketing', label: 'MARKETING', icon: Megaphone, path: '/admin/leads',
  requiredRoles: ['super_admin', 'admin', 'manager'],
  children: [
    { id: 'leads', label: 'Leads', icon: UserPlus, path: '/admin/leads' },
    { id: 'promotions', label: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { id: 'sms-campaigns', label: 'SMS Campaigns', icon: MessageSquare, path: '/admin/sms-campaigns' },
    { id: 'social-media', label: 'Social Media', icon: Share2, path: '/admin/social-media' },
  ]
},
```

- `Megaphone`, `UserPlus`, `Tag`, `Share2` আইকন import যোগ
- পেজগুলো পরে তৈরি হবে — আপাতত শুধু সাইডবার নেভিগেশন যোগ

### নতুন পেজ ফাইল (placeholder)

| ফাইল | বিবরণ |
|---|---|
| `src/pages/admin/AdminLeads.tsx` | Leads ম্যানেজমেন্ট placeholder পেজ |
| `src/pages/admin/AdminPromotions.tsx` | Promotions placeholder পেজ |
| `src/pages/admin/AdminSmsCampaigns.tsx` | SMS Campaigns placeholder পেজ |
| `src/pages/admin/AdminSocialMedia.tsx` | Social Media placeholder পেজ |

### রাউট যোগ (`src/App.tsx`)

চারটি নতুন রাউট `/admin/` এর children-এ যোগ।

| ফাইল | পরিবর্তন |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | MARKETING গ্রুপ ও সাবমেনু যোগ |
| `src/App.tsx` | ৪টি নতুন রাউট যোগ |
| `src/pages/admin/Admin*.tsx` (×4) | Placeholder পেজ তৈরি |

