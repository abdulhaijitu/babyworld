

## Plan: Modal UI/UX Audit & Fix

### Issues Found

1. **No scroll on modal content** — Form is long (Name, Description, Price, Type, Duration, Category, Active toggle, Image) but DialogContent has no max-height/scroll, causing overflow on smaller screens
2. **Plain textarea** instead of the `Textarea` component from UI library
3. **No visual grouping** — all fields stacked flatly, no sections or dividers
4. **Image upload area too small** and lacks clear visual hierarchy
5. **Footer buttons not sticky** — when content overflows, buttons scroll away
6. **No field validation feedback** — empty name just disables button silently
7. **Dialog too narrow** for the amount of content (`max-w-lg` default)

### Fixes

#### 1. DialogContent — Scrollable with sticky footer
- Add `max-h-[85vh]` and `overflow-y-auto` to form area
- Keep DialogHeader and DialogFooter outside scroll area
- Widen dialog to `max-w-xl`

#### 2. Form Layout — Grouped sections
- **Basic Info** section: Name + Description (use `Textarea` component)
- **Pricing & Type** section: Price + Type + Duration in a grid
- **Settings** section: Category + Active toggle side by side
- **Image** section: Larger upload area with better styling
- Add subtle section dividers with `Separator`

#### 3. Better field styling
- Replace raw `<textarea>` with imported `Textarea` component
- Add required asterisk (*) on Name field
- Improve image preview to be larger and more prominent

#### 4. Delete dialog — Add ride name highlight
- Bold the ride name in delete confirmation

### Files Modified
| File | Change |
|------|--------|
| `src/pages/admin/AdminRides.tsx` | Modal layout, scrollable content, grouped form sections, Textarea import, wider dialog |

