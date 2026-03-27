

## প্ল্যান: Gate Logs কে Ticketing সাবমেনুতে সরানো

### পরিবর্তন: `src/components/admin/AdminSidebar.tsx`

- `allMenuItems` থেকে আলাদা `gate-logs` আইটেম রিমুভ করা হবে
- Ticketing গ্রুপের `children` এ Rides এর পরে Gate Logs যোগ হবে:

```text
Ticketing
  ├── Create Ticket  → /admin/create-ticket
  ├── Ticket List    → /admin/ticket-list
  ├── Rides          → /admin/rides
  └── Gate Logs      → /admin/gate-logs
```

একটি ফাইলে ছোট পরিবর্তন, কোনো DB বা রাউট পরিবর্তন লাগবে না।

