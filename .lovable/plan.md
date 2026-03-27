

## Plan: Sidebar Animations & Live Status Badges

### 1. Smooth Animations

**File:** `src/components/admin/AdminSidebar.tsx`

- Add Framer Motion for sidebar transitions:
  - **Collapsible groups**: Animate height + opacity when expanding/collapsing (replace raw Radix CollapsibleContent with motion.div)
  - **Menu items**: Staggered fade-in on initial render (each item appears 30ms after the previous)
  - **Active indicator**: Animated left-border bar (3px primary color) that slides to the active item using `layoutId`
  - **Hover effects**: Scale up icon slightly (1.1x) on hover with spring animation
  - **Collapse/expand**: Animate sidebar width change smoothly (w-16 ↔ w-64) with framer-motion `animate`
  - **Search bar**: Slide down + fade in when sidebar expands

### 2. Live Status Badges

**New hook:** `src/hooks/useSidebarBadges.ts`
- Single hook that queries real-time counts from the database:
  - **Food Orders**: Pending/new orders count today
  - **Ticketing**: Today's ticket count
  - **Leads**: New/uncontacted leads count
  - **Notifications**: Unread notification count
- Uses Supabase realtime subscription for live updates
- Returns `Record<string, number>` mapped to menu item IDs

**File:** `src/components/admin/AdminSidebar.tsx`
- Render animated badge pills next to menu labels when count > 0
- Badge style: small rounded pill with primary background, white text, pulse animation for new items
- In collapsed mode: show badge as a small dot on the icon corner
- Badge appears/disappears with scale animation

### Technical Details

- Framer Motion is already in the project (used in Navbar, etc.)
- `layoutId` on the active indicator ensures smooth sliding between items
- Realtime subscription auto-cleans up on unmount
- Badges only show for items with count > 0 (no visual clutter)
- All animations use `duration: 0.2s` to match existing project timing

### Files Changed
| File | Action |
|------|--------|
| `src/hooks/useSidebarBadges.ts` | Create — realtime badge counts |
| `src/components/admin/AdminSidebar.tsx` | Update — add animations + badge rendering |

