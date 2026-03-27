

## Plan: Admin Sidebar-কে Modern Design-এ আপগ্রেড করা

প্রদত্ত `modern-side-bar.tsx` ডিজাইন অনুসরণ করে বিদ্যমান `AdminSidebar.tsx`-এর স্টাইলিং আপডেট করা হবে। নতুন কম্পোনেন্ট কপি করার বদলে, বিদ্যমান সাইডবারের মেনু আইটেম, রোল-ভিত্তিক ফিল্টারিং ও রাউটিং লজিক রেখে শুধু ভিজ্যুয়াল ডিজাইন পরিবর্তন করা হবে।

### যা পরিবর্তন হবে (`AdminSidebar.tsx`)

1. **Header**: Logo + "Admin" টেক্সটের পাশে collapse বাটন — modern card-style header with avatar-like logo treatment
2. **Search Bar**: Collapsed না থাকলে মেনুর উপরে একটি সার্চ ইনপুট (মেনু আইটেম ফিল্টার করতে)
3. **Nav Items Styling**: 
   - Active: `bg-primary/10 text-primary` (blue-50 স্টাইলের মতো, প্রজেক্টের primary color ব্যবহার করে)
   - Hover: `hover:bg-muted hover:text-foreground`
   - Icon wrapper with subtle background on active state
   - Tooltip on collapsed state (title attribute already exists, add proper tooltip)
4. **Collapsible Groups**: ChevronDown অ্যানিমেশন ঠিক রেখে স্টাইল modernize
5. **Bottom Section**: 
   - User profile section with avatar (email initials), name/email display
   - Logout বাটন red accent সহ (`text-red-600 hover:bg-red-50`)
6. **Mobile**: Sheet-based সাইডবার, overlay with backdrop blur
7. **Transitions**: `transition-all duration-200` সব আইটেমে

### যা পরিবর্তন হবে না
- মেনু আইটেমের তালিকা ও ক্রম (allMenuItems)
- রোল-ভিত্তিক ফিল্টারিং লজিক
- রাউটিং ও path matching
- AdminLayout.tsx structure

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/admin/AdminSidebar.tsx` | সম্পূর্ণ SidebarContent রি-স্টাইল — header, search, nav items, bottom profile/logout |

NPM dependency: `lucide-react` ইতিমধ্যে ইনস্টল আছে।

