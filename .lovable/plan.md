

## সমস্যা

মোবাইলে দুটি টপ বার ওভারল্যাপ করছে:
- **AdminSidebar** → `fixed top-0 z-50 h-14` (হ্যামবার্গার + লোগো + "Admin")
- **AdminLayout** → `sticky top-0 z-30 h-12` (হ্যামবার্গার + পেইজ টাইটেল + নোটিফিকেশন বেল)

সাইডবারের বারটি (z-50) লেআউটের বারকে (z-30) ঢেকে দিচ্ছে, তাই পেইজ হেডার দেখা যাচ্ছে না।

## সমাধান

**AdminSidebar.tsx** থেকে মোবাইল ফিক্সড হেডার (line 567-591) সরিয়ে দেওয়া। কারণ AdminLayout-এ ইতিমধ্যেই হ্যামবার্গার মেনু, পেইজ টাইটেল এবং নোটিফিকেশন বেল সহ একটি টপ বার আছে। Sheet কম্পোনেন্ট রাখা হবে কিন্তু ফিক্সড হেডার div সরানো হবে।

### পরিবর্তন — `src/components/admin/AdminSidebar.tsx`

**Line 554-593** — মোবাইল সেকশন পরিবর্তন:

```tsx
// আগে (দুটি element: fixed header + Sheet)
<div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 ...">
  <Sheet>...</Sheet>
  <div>logo + "Admin"</div>
</div>

// পরে (শুধু Sheet, কোনো fixed header নেই)
<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  <SheetContent side="left" className="p-0 w-64">
    <SidebarContent ... />
  </SheetContent>
</Sheet>
```

SheetTrigger সরানো হবে কারণ AdminLayout-এর হ্যামবার্গার বাটন ইতিমধ্যেই `setMobileMenuOpen(true)` কল করে, যা `externalMobileOpen` prop এর মাধ্যমে Sheet খোলে।

### ফাইল
- `src/components/admin/AdminSidebar.tsx` (মোবাইল ফিক্সড হেডার রিমুভ)

