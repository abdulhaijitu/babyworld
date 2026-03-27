

## প্ল্যান: Member Entry আলাদা পেজ ও সাইডবার সাবমেনু

### কী হবে
- Member Entry ট্যাবকে `AdminMemberships.tsx` থেকে আলাদা করে নতুন পেজ `AdminMemberEntry.tsx` বানানো হবে
- সাইডবারে Membership গ্রুপে "All Members" এর নিচে "Member Entry" সাবমেনু যোগ হবে

### পরিবর্তন

**১. নতুন পেজ তৈরি: `src/pages/admin/AdminMemberEntry.tsx`**
- `MemberEntryTab` কম্পোনেন্ট ব্যবহার করে একটি ফুল পেজ তৈরি — হেডার সহ

**২. `src/pages/admin/AdminMemberships.tsx` থেকে Member Entry ট্যাব সরানো**
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` রিমুভ
- শুধু All Members কন্টেন্ট রাখা হবে (ট্যাব ছাড়া)
- `MemberEntryTab` ইম্পোর্ট রিমুভ

**৩. `src/components/admin/AdminSidebar.tsx` — Membership সাবমেনুতে যোগ**
```
Membership
  ├── Packages        → /admin/membership-packages
  ├── All Members     → /admin/memberships
  └── Member Entry    → /admin/member-entry
```

**৪. `src/App.tsx` — নতুন রাউট যোগ**
- `<Route path="member-entry" element={<AdminMemberEntry />} />`

