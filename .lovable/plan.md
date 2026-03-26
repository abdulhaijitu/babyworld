

## Plan: Ticketing রাউট পুনর্গঠন

### পরিবর্তন

#### 1. `src/App.tsx` — রাউট আপডেট
- `ticketing` ও `ticketing/create` রাউট সরিয়ে দুটি আলাদা রাউট:
  ```tsx
  <Route path="create-ticket" element={<AdminCreateTicket />} />
  <Route path="ticket-list" element={<AdminTicketing />} />
  ```

#### 2. `src/components/admin/AdminSidebar.tsx` — মেনু আপডেট
- `ticketing` parent মেনু আইটেম সরিয়ে দুটি আলাদা top-level মেনু আইটেম:
  ```tsx
  { id: 'create-ticket', label: 'Create Ticket', icon: Plus, path: '/admin/create-ticket' },
  { id: 'ticket-list', label: 'Ticket List', icon: List, path: '/admin/ticket-list' },
  ```
- children/collapsible লজিক লাগবে না

#### 3. `src/pages/admin/AdminCreateTicket.tsx` — navigate path আপডেট
- Success এ `navigate('/admin/ticket-list')` এ রিডাইরেক্ট

#### 4. `src/pages/admin/AdminTicketing.tsx` — "Create Ticket" বাটনের path আপডেট
- `navigate('/admin/create-ticket')`

| ফাইল | পরিবর্তন |
|---|---|
| `src/App.tsx` | রাউট পরিবর্তন |
| `src/components/admin/AdminSidebar.tsx` | দুটি আলাদা মেনু আইটেম |
| `src/pages/admin/AdminCreateTicket.tsx` | navigate path |
| `src/pages/admin/AdminTicketing.tsx` | navigate path |

