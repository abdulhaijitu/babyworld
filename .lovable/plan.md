

## প্ল্যান: মেম্বারশিপ এন্ট্রি ম্যানেজমেন্ট সিস্টেম

### বর্তমান অবস্থা
- মেম্বারশিপ তৈরি ও তালিকা দেখা যায় (`AdminMemberships`)
- টিকেটিং সিস্টেমে (`CounterTicketForm`) ফোন দিয়ে মেম্বারশিপ চেক হয় এবং ডিসকাউন্ট প্রযোজ্য হয়
- `tickets` টেবিলে `membership_id` ফিল্ড আছে — মেম্বারের টিকেট লিংক করা সম্ভব
- কিন্তু মেম্বারদের ভিজিট হিস্ট্রি, এন্ট্রি ট্র্যাকিং, বা ড্যাশবোর্ড ভিউ নেই

### কী তৈরি হবে

**১. মেম্বার এন্ট্রি ট্যাব (AdminMemberships পেজে)**
- বর্তমান "All Members" ট্যাবের পাশে নতুন **"Member Entry"** ট্যাব
- ফোন নম্বর বা QR স্ক্যান করে মেম্বার খুঁজুন
- মেম্বার পাওয়া গেলে প্রোফাইল কার্ড দেখাবে: নাম, প্যাকেজ, বাকি দিন, স্ট্যাটাস
- **"Check In"** ও **"Check Out"** বাটন — ক্লিক করলে একটি এন্ট্রি লগ তৈরি হবে
- আজকের ভিজিট কাউন্ট ও শেষ ভিজিটের তারিখ দেখাবে

**২. নতুন ডাটাবেস টেবিল: `membership_visits`**
- `id`, `membership_id`, `check_in_at`, `check_out_at`, `checked_in_by` (staff user id), `notes`
- RLS: admin/manager/staff পড়তে ও লিখতে পারবে

**৩. মেম্বার ভিজিট হিস্ট্রি**
- প্রতিটি মেম্বারের ড্রপডাউন/মোডালে তার ভিজিট লগ দেখা যাবে (তারিখ, চেক-ইন/আউট সময়)
- All Members টেবিলে "Total Visits" কলাম যোগ

**৪. আজকের মেম্বার সামারি**
- Member Entry ট্যাবের উপরে মেট্রিক্স: আজকের চেক-ইন সংখ্যা, বর্তমানে ভেতরে আছে, চেক-আউট হয়েছে

### টেকনিক্যাল ডিটেইলস

**DB Migration:**
```sql
CREATE TABLE public.membership_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  checked_in_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_visits ENABLE ROW LEVEL SECURITY;

-- Staff+ can view & manage
CREATE POLICY "Staff can manage visits" ON public.membership_visits
  FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));
```

**ফাইল পরিবর্তন:**
- `src/pages/admin/AdminMemberships.tsx` — ট্যাব যোগ, Member Entry UI, ভিজিট হিস্ট্রি
- DB migration — `membership_visits` টেবিল তৈরি

