

## Plan: Rides কে Ticketing সাবমেনুতে যোগ করা

### পরিবর্তন — `src/components/admin/AdminSidebar.tsx`

1. **Ticketing children অ্যারেতে** `ticket-list` এর পরে Rides সাব-আইটেম যোগ:
   ```tsx
   { id: 'rides', label: 'Rides', icon: FerrisWheel, path: '/admin/rides' },
   ```

2. **আলাদা `rides` মেনু আইটেম রিমুভ** (লাইন ~61 এ আছে) — কারণ এটি এখন Ticketing এর ভেতরে থাকবে।

| ফাইল | পরিবর্তন |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | Rides কে Ticketing children-এ মুভ, আলাদা এন্ট্রি রিমুভ |

