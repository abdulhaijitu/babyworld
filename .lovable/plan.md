

## Plan: Sidebar-এ EVENTS গ্রুপ যোগ করা

**AdminSidebar.tsx** ফাইলে `allMenuItems` অ্যারেতে Foods আইটেমের পরে একটি নতুন "Events" গ্রুপ মেনু আইটেম যোগ করা হবে, যার একটি সাবমেনু থাকবে "Events" (existing `/admin/events` route ব্যবহার করে)।

বর্তমানে `events` একটি standalone মেনু আইটেম হিসেবে আছে — সেটি সরিয়ে গ্রুপ আইটেমে রূপান্তর করা হবে।

### পরিবর্তন

**`src/components/admin/AdminSidebar.tsx`**:
- `allMenuItems` থেকে standalone `events` আইটেম সরানো হবে
- Foods এর পরে নতুন গ্রুপ আইটেম যোগ:
  ```
  { id: 'events-group', label: 'Events', icon: PartyPopper, path: '/admin/events',
    requiredRoles: ['super_admin', 'admin', 'manager'],
    children: [
      { id: 'events', label: 'Events', icon: PartyPopper, path: '/admin/events' },
    ]
  }
  ```

কোনো নতুন ফাইল বা রাউট পরিবর্তন দরকার নেই।

