

## সমস্যা

`bookings` টেবিলে INSERT করার কোনো RLS policy নেই। শুধু SELECT policy আছে। তাই Admin Events পেজ থেকে নতুন ইভেন্ট তৈরি করলে `"new row violates row-level security policy"` এরর আসছে।

## সমাধান

**Database Migration** -- `bookings` টেবিলে INSERT, UPDATE, DELETE RLS policies যোগ করা:

- **INSERT**: admin, manager, staff পারবে
- **UPDATE**: admin, manager, staff পারবে  
- **DELETE**: শুধু admin পারবে

```sql
CREATE POLICY "Staff can create bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Staff can update bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
```

কোনো কোড পরিবর্তনের প্রয়োজন নেই -- শুধু database migration।

