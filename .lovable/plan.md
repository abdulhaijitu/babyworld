

## প্ল্যান: Foods মেইন মেনু ও সাবমেনু যোগ

### পরিবর্তন: `src/components/admin/AdminSidebar.tsx`

বর্তমান `food` আইটেমটি (লাইন ৬১) রিপ্লেস করে Membership এর ঠিক নিচে একটি নেস্টেড মেনু বসাবো:

```text
Membership
  ├── Packages
  ├── All Members
  └── Member Entry
Foods                    ← নতুন গ্রুপ মেনু
  ├── Items              → /admin/food (বর্তমান Food Sales পেজ)
  └── Orders             → /admin/food-orders (নতুন রাউট)
```

- বর্তমান একক `food` আইটেম রিমুভ করে `children` সহ গ্রুপ মেনু বানাবো
- `Items` সাবমেনু `/admin/food` এ পয়েন্ট করবে (বর্তমান পেজ)
- `Orders` সাবমেনু `/admin/food-orders` এ পয়েন্ট করবে
- আইকন ও রোল পারমিশন আগের মতোই থাকবে

**নোট:** Orders পেজ (`/admin/food-orders`) এর রাউট ও পেজ কম্পোনেন্ট এখনো তৈরি করা হয়নি — প্রয়োজনে পরে তৈরি করা যাবে, অথবা এই ধাপেই একটি প্লেসহোল্ডার পেজ বানানো যাবে।

