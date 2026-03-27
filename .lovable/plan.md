

## সমস্যা

লাইন 278-এ `open` প্রপের লজিক:
```
open={openGroups[item.id] ?? childActive ?? !!searchQuery.trim()}
```

যখন একটি সাবমেনু অ্যাক্টিভ (যেমন Marketing-এর কোনো পেজে আছেন), তখন `openGroups[item.id]` `undefined` হলে `childActive` `true` রিটার্ন করে — তাই কোলাপস করতে পারে না।

## সমাধান

**ফাইল:** `src/components/admin/AdminSidebar.tsx`

`openGroups`-এ explicit `false` সেট হলে সেটাকে সম্মান করতে হবে। `??` অপারেটর `undefined/null` চেক করে কিন্তু `false` পাস করে দেয় না — তাই লজিক ঠিকই আছে মনে হলেও সমস্যা হচ্ছে কারণ accordion লজিকে (`setOpenGroups(open ? { [item.id]: true } : {})`) কোলাপস করলে key-টাই মুছে যায়, ফলে `undefined` হয় এবং `childActive`-এ ফলব্যাক হয়।

**ফিক্স:** `openGroups`-এ key আছে কিনা চেক করে সিদ্ধান্ত নিতে হবে:

```typescript
// লাইন 278
open={item.id in openGroups ? openGroups[item.id] : (childActive || !!searchQuery.trim())}
```

এবং `onOpenChange` (লাইন 279) আপডেট:
```typescript
onOpenChange={(open) => setOpenGroups(open ? { [item.id]: true } : { [item.id]: false })}
```

এতে কোলাপস করলে explicit `false` সেট হবে, এবং `in` চেক দিয়ে বোঝা যাবে ইউজার নিজে কোলাপস করেছে — তখন আর `childActive`-এ ফলব্যাক হবে না।

