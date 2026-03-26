

## পরিকল্পনা: সকল পেইজ স্ট্রিক্টলি ইংরেজি করা

### সমস্যা
বর্তমানে সাইটে বাংলা/ইংরেজি ভাষা টগল আছে। ব্যবহারকারী চান সব পেইজ শুধুমাত্র ইংরেজিতে থাকবে।

### পরিকল্পনা

**1. ভাষা টগল বাটন সরানো**
- `src/components/Navbar.tsx` — `<LanguageToggle />` কম্পোনেন্ট রিমুভ (ডেস্কটপ ও মোবাইল উভয় জায়গা থেকে)
- `src/pages/admin/AdminLayout.tsx` — `<LanguageToggle />` রিমুভ

**2. LanguageContext লক করা**
- `src/contexts/LanguageContext.tsx` — ডিফল্ট ভাষা `"en"` রাখা (ইতিমধ্যে আছে), এবং `setLanguage` ফাংশনকে no-op করা যাতে কোনোভাবেই ভাষা পরিবর্তন না হয়
- `font-bangla` ক্লাস wrapper সরানো

**3. Admin পেইজগুলোতে হার্ডকোড ইংরেজি**
- ৪৬টি ফাইলে `language === 'bn' ? '...' : '...'` প্যাটার্ন আছে। এগুলো সব ইংরেজি স্ট্রিং দিয়ে রিপ্লেস করা হবে (ternary সরিয়ে শুধু English string রাখা)
- এটি কোড ক্লিনআপ হিসেবে কাজ করবে এবং bundle size কমাবে

**4. Translation ডেটা রাখা**
- `translations` অবজেক্টের `bn` সেকশন এবং `en` সেকশন রেখে দেওয়া যাবে — `t()` ফাংশন সবসময় `en` থেকে পড়বে। ভবিষ্যতে বাংলা আবার চালু করতে চাইলে সহজ হবে।

### প্রভাব
- কোনো ফাংশনালিটি নষ্ট হবে না
- পেমেন্ট, বুকিং, অ্যাডমিন সিস্টেম সব আগের মতোই কাজ করবে
- শুধু UI টেক্সট সব ইংরেজিতে ফিক্সড হবে

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/contexts/LanguageContext.tsx` | `setLanguage` no-op, font-bangla wrapper সরানো |
| `src/components/Navbar.tsx` | LanguageToggle রিমুভ |
| `src/pages/admin/AdminLayout.tsx` | LanguageToggle রিমুভ |
| ৪৬টি অ্যাডমিন/কম্পোনেন্ট ফাইল | `language === 'bn'` ternary → English only string |

