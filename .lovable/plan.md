

## Plan: ট্যাব সিস্টেম সরিয়ে সরাসরি কন্টেন্ট দেখানো

### পরিবর্তন

**`src/pages/admin/AdminTicketing.tsx`**:

1. **Tabs কম্পোনেন্ট সম্পূর্ণ সরানো** — `TabsList`, `TabsTrigger`, `TabsContent` সব রিমুভ
2. **URL param (`?tab=create` / `?tab=list`) অনুযায়ী conditionally render** করা:
   - `tab === 'create'` হলে শুধু `<CounterTicketForm />` দেখাবে
   - অন্যথায় (default `list`) শুধু stats cards + ticket table দেখাবে
3. **Tabs import সরানো** — `Tabs, TabsContent, TabsList, TabsTrigger` import রিমুভ
4. টিকেট তৈরি সফল হলে `handleTicketCreated`-এ `setSearchParams({ tab: 'list' })` দিয়ে লিস্টে ফিরে যাবে

### ফলাফল
- Sidebar-এ "Create Ticket" ক্লিক → শুধু Create Ticket ফর্ম
- Sidebar-এ "Ticket List" ক্লিক → শুধু টিকেট লিস্ট/টেবিল
- কোনো ট্যাব বার থাকবে না

### ফাইল
| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminTicketing.tsx` | Tabs রিমুভ, conditional rendering |

