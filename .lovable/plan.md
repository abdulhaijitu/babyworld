

## Plan: Ride Form ও Table আপডেট

### পরিবর্তন

#### 1. Database Migration — `description` কলাম যোগ
```sql
ALTER TABLE public.rides ADD COLUMN description text DEFAULT '';
```

#### 2. `AdminRides.tsx` পরিবর্তন

**ফর্ম (`renderRideForm`):**
- **Description** টেক্সটএরিয়া যোগ (Name ফিল্ডের নিচে)
- **Duration** লেবেল `"Duration (minutes)"` → `"Duration (hour)"` এবং ভ্যালু hour হিসেবে handle (ইনপুটে hour, DB তে minutes এ কনভার্ট)
- **Max Riders** ফিল্ড সম্পূর্ণ রিমুভ

**Interface ও Data:**
- `Ride` interface এ `description: string | null` যোগ
- `defaultFormData` এ `description: ''` যোগ, `max_riders` রিমুভ
- `handleEdit` এ `description` ম্যাপ, `max_riders` রিমুভ
- Create/Update mutation থেকে `max_riders` রিমুভ, `description` যোগ
- Duration ইনপুট hour এ দেখাবে, সেভের সময় `hours * 60` করে minutes এ DB তে পাঠাবে

**টেবিল:**
- **Max Rider** কলাম রিমুভ
- **Duration** কলামে `X hr` বা `X.Y hr` ফরম্যাটে দেখাবে

### ফাইল
| ফাইল | পরিবর্তন |
|------|--------|
| Database migration | `description` কলাম যোগ |
| `src/pages/admin/AdminRides.tsx` | ফর্মে Description যোগ, Duration hour এ, Max Riders রিমুভ |

