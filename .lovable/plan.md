

## Plan: Rides Page Table & Modal Redesign

### Reference Analysis
The uploaded screenshots show a professional ride management table with columns: **SL, Image, Name, Type, Price, Duration, Max Rider, Status, Action** — plus search bar, pagination, and "Show entries" control. Current DB is missing `duration` and `max_rider` columns.

### Changes

#### 1. Database Migration — Add missing columns
```sql
ALTER TABLE public.rides ADD COLUMN duration_minutes integer DEFAULT 0;
ALTER TABLE public.rides ADD COLUMN max_riders integer DEFAULT null;
ALTER TABLE public.rides ADD COLUMN ride_type text DEFAULT 'Paid';
```

#### 2. Table Redesign (`AdminRides.tsx`)
- **Add SL column** (serial number)
- **Replace "Category" with "Type"** column showing Paid/Free badge (green text)
- **Add "Duration" column** — display as `X min`
- **Add "Max Rider" column** — numeric display
- **Status column** — replace Switch with colored text badge ("Active" green / "Inactive" red)
- **Actions column** — styled Edit (yellow) and Delete (red) icon buttons matching reference
- **Add search bar** — filter by ride name (top-right)
- **Add pagination** — "Showing X to Y of Z entries" + Previous/Next + page numbers
- **Add "Show entries" dropdown** — 10/25/50 per page (top-left)
- **Remove category filter** from card header (replaced by search)

#### 3. Form/Modal Updates
- Add **Duration (minutes)** input field
- Add **Max Riders** input field
- Add **Type** select (Paid/Free)
- Keep existing: Name, Price, Image upload, Active toggle

#### 4. Stats Cards Update
- Keep 5 cards but replace Kids/Family/Thrill with: **Total, Active, Inactive, Paid, Free**

### Files Modified
| File | Change |
|------|--------|
| `src/pages/admin/AdminRides.tsx` | Full table + modal + pagination redesign |
| Database migration | Add `duration_minutes`, `max_riders`, `ride_type` columns |

### Summary
Table gets SL numbers, Type/Duration/MaxRider columns, search, pagination, and styled action buttons matching the reference. Modals get new fields for the added columns.

