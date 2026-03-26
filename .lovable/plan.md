

## Plan: MEMBERSHIP সাবমেনু তৈরি

### পরিবর্তন — `src/components/admin/AdminSidebar.tsx`

বর্তমান standalone `memberships` আইটেমকে (লাইন 53) children সহ প্যারেন্ট মেনুতে রূপান্তর:

```tsx
{ id: 'membership', label: 'Membership', icon: Crown, path: '/admin/membership-packages', requiredRoles: ['super_admin', 'admin', 'manager'], children: [
  { id: 'membership-packages', label: 'Packages', icon: List, path: '/admin/membership-packages' },
  { id: 'memberships', label: 'Memberships', icon: Crown, path: '/admin/memberships' },
]},
```

### নতুন ফাইল — `src/pages/admin/AdminMembershipPackages.tsx`

- Membership Packages ম্যানেজমেন্ট পেজ (Monthly, Quarterly, Yearly প্যাকেজ দেখানো/এডিট)
- ডাটাবেজে `membership_packages` টেবিল থেকে ডাটা পড়বে (যদি টেবিল না থাকে, মাইগ্রেশন তৈরি হবে)

### রাউট — `src/App.tsx`

`/admin/membership-packages` রাউট যোগ করা।

| ফাইল | পরিবর্তন |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | Membership প্যারেন্ট মেনু + children |
| `src/pages/admin/AdminMembershipPackages.tsx` | নতুন Packages পেজ |
| `src/App.tsx` | নতুন রাউট যোগ |

