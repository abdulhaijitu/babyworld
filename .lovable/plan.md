

## Audit: Foods Sidebar Menu & Relations

### Issues Found

1. **POS submenu icon is `Plus`** — misleading; `Plus` suggests "add new", not "point of sale". Should use `Monitor` or similar.

2. **Duplicate "New Order" in Food Orders page** — `AdminFoodOrders.tsx` has a full "New Order" dialog (with cart, item selection, category tabs) that duplicates the dedicated POS page (`AdminFoodPOS.tsx`). This is confusing and redundant.

3. **Collapsible `defaultOpen` is uncontrolled** — uses `defaultOpen={childActive}` which only works on first render. If user navigates to a Foods child route after sidebar mounts, the Foods group won't auto-expand. Should use controlled `open` state.

4. **`childActive` detection is fragile** — `location.pathname.startsWith(item.path)` where Foods `item.path = '/admin/food'` matches `/admin/food-pos`, `/admin/food-orders` by coincidence. This works but is implicit. A cleaner approach: check if pathname matches any child's path.

5. **Food Sales page label** — Component is `AdminFoodSales` but sidebar label is "Items". Consistent but route is `/admin/food` which is vague. Minor but noted.

### Plan

**File: `src/components/admin/AdminSidebar.tsx`**
- Change POS icon from `Plus` to `Monitor` (import from lucide)
- Change Foods submenu order to: POS → Orders → Items (POS first as primary action)
- Fix `childActive` to check `item.children.some(c => location.pathname === c.path)` instead of relying on `startsWith(item.path)`
- Convert Collapsible from uncontrolled (`defaultOpen`) to controlled (`open` + `onOpenChange`) using state, so groups auto-expand when navigating

**File: `src/pages/admin/AdminFoodOrders.tsx`**
- Remove the duplicate "New Order" dialog and button entirely (POS page handles this)
- Keep page focused on order list/management only

### Technical Details

Sidebar Collapsible fix — track open groups in state:
```tsx
const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
// Auto-open group containing active child
useEffect(() => {
  menuItems.forEach(item => {
    if (item.children?.some(c => location.pathname === c.path)) {
      setOpenGroups(prev => ({ ...prev, [item.id]: true }));
    }
  });
}, [location.pathname]);
```

### Files Changed
| File | Change |
|------|--------|
| `src/components/admin/AdminSidebar.tsx` | Fix icons, submenu order, controlled collapsible |
| `src/pages/admin/AdminFoodOrders.tsx` | Remove duplicate New Order dialog |

