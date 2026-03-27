

## Plan: Accordion-Style Sidebar (One Group Open at a Time)

### What Changes

**File:** `src/components/admin/AdminSidebar.tsx`

Currently, `openGroups` is a `Record<string, boolean>` that allows multiple groups to be open simultaneously. The change is simple:

1. **Modify `onOpenChange` handler** (line 279): When a group is opened, close all other groups first. When a group is closed, just close it.
   - Replace: `setOpenGroups(prev => ({ ...prev, [item.id]: open }))`
   - With: `setOpenGroups(open ? { [item.id]: true } : {})`

2. **Update the `useEffect`** (lines 170-176) that auto-opens groups on route change: Instead of merging into existing state, set only the matching group as open.
   - Replace: `setOpenGroups(prev => ({ ...prev, [item.id]: true }))`
   - With: `setOpenGroups({ [item.id]: true })`

This gives accordion behavior — clicking a group expands it and collapses any previously open group. The active route's group still auto-opens on navigation.

No new files, no structural changes — just two small logic tweaks in the existing file.

