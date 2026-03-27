

## UI/UX Audit & Fix Plan — All Public Pages

### Issues Found

#### 1. **App.css — Unused Vite boilerplate conflicting with layout**
- `src/App.css` has `#root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }` — this is leftover Vite boilerplate that could constrain layout width and add unwanted padding/centering if imported anywhere.
- **Fix**: Delete `src/App.css` entirely (it's not imported in current code but is a risk).

#### 2. **NotFound page — Minimal, no branding**
- Plain text, no logo, no navigation, no consistent design.
- **Fix**: Add logo, better illustration (emoji-based), "Back to Home" button styled consistently, add Navbar.

#### 3. **GoogleMap section — Missing container padding on mobile**
- `<div className="container mx-auto">` but no `px-4` padding — content touches edges on mobile.
- **Fix**: Add `px-4 sm:px-6` to the container.

#### 4. **Contact page — "Get Directions" button not linked**
- `ContactSection.tsx` line 98: Button says "Get Directions" but has no link/onClick.
- **Fix**: Link it to Google Maps directions URL.

#### 5. **Gallery page — Missing WhatsApp floating button spacing**
- WhatsApp floating button and bottom nav are present, but no `WhatsAppButton` is missing from some consideration.
- Actually OK. No change needed.

#### 6. **BookingSection — Mobile summary panel hidden**
- Desktop summary is `hidden lg:block`. On mobile, the booking summary/CTA is only in a sticky panel at the bottom (line 372+), but let me verify.
- Need to check the mobile sticky panel exists. It does (line ~429+).
- OK, no major issue.

#### 7. **PromoBanner — Not used on any page**
- `PromoBanner.tsx` exists but is not rendered on any page layout.
- **Fix**: Add it to Index page above Navbar (or decide to remove).

#### 8. **Hero Section — Offer/Event cards too small on mobile**
- `grid-cols-2 lg:grid-cols-1` for the right column cards — on small screens (< 640px), two cards side by side get very cramped.
- **Fix**: Change to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-1` so they stack on very small screens.

#### 9. **Footer — "Baby World" shown twice with odd Bangla class**
- Line 33-34: Shows "Baby World • Baby World" with `font-bangla` class but same English text.
- **Fix**: Remove the duplicate or show the actual Bangla name "বেবি ওয়ার্ল্ড".

#### 10. **ReviewForm — Not saving to database**
- Reviews are UI-only (simulated submission). No Supabase integration.
- **Fix**: This is a larger feature. Note but don't fix in this pass.

#### 11. **PlayBooking page — Missing WhatsApp floating button**
- Unlike Index page, PlayBooking doesn't have `<WhatsAppButton variant="floating" />`.
- **Fix**: Add it.

#### 12. **BirthdayEvents page — Missing WhatsApp floating button**
- Same issue.
- **Fix**: Add it.

#### 13. **Contact page — Missing WhatsApp floating button**
- Same issue.
- **Fix**: Add it.

#### 14. **Gallery page — Video placeholders use rickroll**
- Videos use `dQw4w9WgXcQ` (rickroll) as placeholder YouTube ID.
- **Fix**: Replace with the actual Baby World video ID `v9fVa72l-Jg` used in VideoSection.

#### 15. **Accessibility — Missing skip-to-content link**
- No skip navigation link for keyboard users across all pages.
- Scope: Low priority, skip for now.

#### 16. **MobileBottomNav — Gallery page not in nav**
- Gallery is accessible via Footer quick links but not from mobile bottom nav or main Navbar.
- **Fix**: Add Gallery to Navbar links.

### Implementation Plan

**File changes (7 files):**

1. **Delete `src/App.css`** — remove unused Vite boilerplate

2. **`src/pages/NotFound.tsx`** — redesign with logo, branding, proper layout, Navbar

3. **`src/components/GoogleMap.tsx`** — add `px-4 sm:px-6` to container

4. **`src/components/ContactSection.tsx`** — link "Get Directions" button to Google Maps

5. **`src/components/HeroSection.tsx`** — fix mobile card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-1`

6. **`src/components/Footer.tsx`** — fix duplicate brand text, show Bangla name properly

7. **`src/pages/PlayBooking.tsx`** — add WhatsAppButton floating

8. **`src/pages/BirthdayEvents.tsx`** — add WhatsAppButton floating

9. **`src/pages/Contact.tsx`** — add WhatsAppButton floating

10. **`src/pages/Gallery.tsx`** — fix video placeholder IDs

11. **`src/components/Navbar.tsx`** — add Gallery link to nav

12. **`src/pages/Index.tsx`** — add PromoBanner above Navbar

