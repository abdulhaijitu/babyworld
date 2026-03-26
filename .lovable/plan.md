

## Plan: CounterTicketForm কমপ্যাক্ট রিডিজাইন

রেফারেন্স ইমেজ অনুসরণ করে **2-কলাম লেআউট** — বামে Rides সিলেক্ট, ডানে ফর্ম ফিল্ড ও প্রাইসিং — সব একনজরে দেখা যাবে।

### লেআউট পরিবর্তন

```text
┌─ Entry Ticket Form ──────────────────────────────────────┐
│                                                          │
│  ┌─ Left (Rides) ─────────┐  ┌─ Right (Form) ─────────┐ │
│  │ Search rides...        │  │ Entry No   Customer Name│ │
│  │ ┌─────────────────┐ ☐ Q│  │ Phone      Address      │ │
│  │ │ Horse Ride ৳170 │ 1  │  │ Guardians  Children     │ │
│  │ │ Bike Race  ৳230 │ 1  │  │ Total Amount   Discount │ │
│  │ │ Water Gun  ৳130 │ 1  │  │ Grand Total             │ │
│  │ │ Socks      ৳50  │ 1  │  │ Valid Until (auto)      │ │
│  │ │ ...scrollable   │    │  │ Payment Method          │ │
│  │ └─────────────────┘    │  │ [Create Ticket]         │ │
│  └────────────────────────┘  └─────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### মূল পরিবর্তন (`CounterTicketForm.tsx`)

1. **লেআউট**: 3-কলাম → 2-কলাম (`lg:grid-cols-2`)
   - **বাম কলাম**: Rides তালিকা — scrollable list format (card grid নয়), প্রতিটি ride একটি row-তে: নাম, price badge, checkbox, quantity input। উপরে search input। Socks-ও এই list-এ থাকবে।
   - **ডান কলাম**: সব ফর্ম ফিল্ড + price summary একসাথে (আলাদা cards নয়, একটি compact form)

2. **Rides UI সরলীকরণ**: 
   - Image, rating, category badge রিমুভ
   - Compact list rows — প্রতিটিতে: colored bar, name, ৳price badge, checkbox, quantity
   - Search by name ফিল্টার যোগ

3. **ডান ফর্ম compact করা**:
   - একাধিক Card রিমুভ → single section
   - Entry No (auto-generated), Customer Name, Phone, Address ফিল্ড
   - Guardian ও Children count inline
   - Total Amount, Coupon Code (optional), Discount, VAT (optional), Grand Total
   - Valid Until (auto-calculated from now + duration)
   - Payment Method (select dropdown), Transaction ID
   - Create Ticket button

4. **নতুন ফিল্ড যোগ**:
   - `customer_address` (optional text)
   - `coupon_code` (optional, with Apply button — placeholder only)
   - `transaction_id` (optional, for online payments)
   - Entry No auto-generate (YYMMDD format + random)

### ফাইল পরিবর্তন

| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/admin/ticketing/CounterTicketForm.tsx` | সম্পূর্ণ UI restructure — 2-column compact layout |

কোনো DB migration লাগবে না — শুধু UI restructure।

