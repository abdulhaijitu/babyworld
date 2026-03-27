

## Admin Mobile Bottom Navigation Bar

### Problem
Admin dashboard has no mobile bottom navigation. On mobile (391px viewport), the sidebar is hidden behind a hamburger menu, making key sections hard to reach.

### Solution
Create an `AdminMobileBottomNav` component showing 5 quick-access tabs at the bottom on mobile screens (`md:hidden`), similar to the public-facing `MobileBottomNav`.

**Tabs:** Dashboard, Tickets, Food POS, Events, More (opens sidebar sheet)

### Changes

**1. Create `src/components/admin/AdminMobileBottomNav.tsx`**
- Fixed bottom bar, visible only on `md:hidden`
- 5 icons: LayoutDashboard → `/admin`, Ticket → `/admin/create-ticket`, UtensilsCrossed → `/admin/food-pos`, PartyPopper → `/admin/event-packages`, Menu → triggers sidebar sheet open
- Active state indicator matching current route
- Backdrop blur background like public nav
- "More" button opens the existing mobile sidebar Sheet

**2. Update `src/pages/admin/AdminLayout.tsx`**
- Import and render `<AdminMobileBottomNav />` inside the layout
- Add bottom padding (`pb-20 md:pb-0`) to the main content area so content isn't hidden behind the nav
- Pass sidebar open state handler to the bottom nav's "More" button

### Technical Notes
- Reuse existing sidebar Sheet mechanism for the "More" menu
- Use `useLocation` for active tab detection
- Match the design language of the public `MobileBottomNav` (blur, border-t, shadow)

