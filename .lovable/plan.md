

## পরিকল্পনা: Ride Reviews পেজ সরানো

`/admin/ride-reviews` রাউট এবং সাইডবার এন্ট্রি সম্পূর্ণ বাদ দেওয়া হবে।

### পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `src/App.tsx` | `ride-reviews` রাউট ও `AdminRideReviews` ইম্পোর্ট মুছে ফেলা |
| `src/components/admin/AdminSidebar.tsx` | `ride-reviews` মেনু আইটেম মুছে ফেলা |
| `src/pages/admin/AdminRideReviews.tsx` | ফাইলটি ডিলিট করা |

