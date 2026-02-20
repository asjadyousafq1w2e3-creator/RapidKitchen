
# Add Professional Desktop Category Dropdown to Header

## Overview
Add a hover-activated "Categories" dropdown menu to the desktop navigation bar. When users hover over "Categories", a clean mega-menu style dropdown will appear showing all categories with icons, descriptions, and links -- matching the store's professional aesthetic.

## Design Approach
- Add a new "Categories" nav item between "Shop" and "About" in the desktop header
- On hover, display an animated dropdown panel with category icons, names, and a "View All" link
- Use `framer-motion` for smooth enter/exit animations
- Dropdown has a solid `bg-popover` background with shadow and border (no transparency issues)
- Auto-closes when mouse leaves the dropdown area

## Technical Details

### File: `src/components/Navbar.tsx`
1. Add a `categoriesOpen` state (`useState<boolean>`) to track hover
2. Insert a "Categories" item in the desktop `<nav>` with `onMouseEnter`/`onMouseLeave` handlers wrapping both the trigger text and the dropdown panel
3. The dropdown will be an absolutely positioned `<div>` rendered with `AnimatePresence` + `motion.div` for fade+slide animation
4. Categories displayed in a responsive grid (2-3 columns depending on count) with:
   - Category icon from the existing `CATEGORY_ICONS` map
   - Category name as a `<Link>` to `/category/{slug}`
   - A footer row with "Browse All Products" linking to `/shop`
5. Add `ChevronDown` icon next to the "Categories" label that rotates on hover
6. Ensure `z-50` or higher on the dropdown so it renders above page content

### Dropdown Structure
```text
+------------------------------------------+
|  [icon] Choppers    [icon] Blenders       |
|  [icon] Knives      [icon] Drinkware      |
|  [icon] Measurement [icon] Garden         |
|------------------------------------------|
|  Browse All Products ->                   |
+------------------------------------------+
```

### Styling
- Background: `bg-popover` with `border border-border` and `shadow-lg rounded-xl`
- Items: hover highlight with `hover:bg-secondary` and smooth color transitions
- Icons in small rounded containers matching the mobile sidebar style
- Entry animation: fade in + slide down from top

### No Database or Migration Changes Required
Categories are already fetched from the database in the existing `useEffect`. The dropdown reuses that data.
