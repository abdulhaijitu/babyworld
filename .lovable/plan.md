

## Plan: সাইডবারে TICKETING গ্রুপ তৈরি

### পরিবর্তন

**`src/components/admin/AdminSidebar.tsx`** — `allMenuItems` অ্যারেতে `create-ticket` ও `ticket-list` আইটেম দুটি সরিয়ে একটি parent "Ticketing" আইটেম বানানো হবে যার মধ্যে children হিসেবে এ দুটি থাকবে:

```tsx
{
  id: 'ticketing',
  label: 'Ticketing',
  icon: Ticket,
  path: '/admin/create-ticket',
  requiredRoles: ['super_admin', 'admin', 'manager', 'staff'],
  children: [
    { id: 'create-ticket', label: 'Create Ticket', icon: Plus, path: '/admin/create-ticket' },
    { id: 'ticket-list', label: 'Ticket List', icon: List, path: '/admin/ticket-list' },
  ]
},
```

এটি সাইডবারে ইতোমধ্যে থাকা `Collapsible` লজিক ব্যবহার করে TICKETING হেডারের নিচে দুটি সাবমেনু দেখাবে।

| ফাইল | পরিবর্তন |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | দুটি আলাদা আইটেম → একটি parent + children |

