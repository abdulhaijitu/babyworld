

## পরিকল্পনা: Dashboard থেকে Quick Actions, Live Visitors, Activity Log সরানো

### পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `src/pages/admin/AdminDashboardContent.tsx` | `QuickActions`, `VisitorCounter`, `ActivityLogCard` কম্পোনেন্ট ও তাদের ইম্পোর্ট সরানো; মাঝের 3-কলাম গ্রিড সেকশন সম্পূর্ণ বাদ |

### ফলাফল লেআউট

```text
Dashboard
├── Expiring Cards Alert
├── Revenue Summary Cards (4 কলাম)
├── Today's Tickets (compact list)
└── Recent Food Orders (compact list)
```

কোনো নতুন ফাইল বা migration লাগবে না। শুধু একটি ফাইলে ~15 লাইন মুছে ফেলা হবে।

