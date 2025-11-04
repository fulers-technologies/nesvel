# Camera Module - Skeleton Components

## Overview
Skeleton components provide visual placeholders during data loading, improving perceived performance and user experience. They mirror the structure of their corresponding components with animated placeholders.

## Components

### 1. **camera-item.skeleton.tsx** (20 lines)
Skeleton for individual camera list items.

**Features:**
- Mirrors camera-item.component structure
- Shows placeholders for: name, status badge, location, IP address
- Uses Tailwind's `animate-pulse` for shimmer effect
- Matches exact spacing and layout

**Usage:**
```tsx
<CameraItemSkeleton />
```

---

### 2. **camera-list.skeleton.tsx** (17 lines)
Skeleton for camera list container.

**Features:**
- Renders multiple CameraItemSkeleton components
- Configurable count (default: 5)
- Matches scrollable container layout

**Props:**
- `count?: number` - Number of skeleton items to display (default: 5)

**Usage:**
```tsx
<CameraListSkeleton count={5} />
```

---

### 3. **camera-form.skeleton.tsx** (43 lines)
Skeleton for camera creation/edit forms.

**Features:**
- Mirrors all form fields:
  - Camera Name
  - Location
  - Status
  - IP Address
  - Stream URL
  - Action buttons (Submit, Cancel)
- Matches exact form layout and spacing
- Uses consistent field heights (h-10 for inputs, h-4 for labels)

**Usage:**
```tsx
<CameraFormSkeleton />
```

---

### 4. **camera-detail.skeleton.tsx** (62 lines)
Skeleton for camera detail page.

**Features:**
- Complete page skeleton with:
  - Header with title and action buttons
  - Content card with shadow
  - 2-column responsive grid
  - All detail fields (location, IP, stream URL, timestamps)
- Matches exact layout from camera-detail.page.tsx
- Responsive (md: breakpoints for grid)

**Usage:**
```tsx
<CameraDetailSkeleton />
```

---

## Integration

### In Pages

#### camera.page.tsx
```tsx
import CameraListSkeleton from "../skeletons/camera-list.skeleton";

{isLoading ? (
  <CameraListSkeleton count={5} />
) : (
  <CameraList cameras={results} />
)}
```

#### camera-detail.page.tsx
```tsx
import CameraDetailSkeleton from "../skeletons/camera-detail.skeleton";

if (isLoading) {
  return <CameraDetailSkeleton />;
}
```

### Standalone Usage

```tsx
import { 
  CameraItemSkeleton,
  CameraListSkeleton,
  CameraFormSkeleton,
  CameraDetailSkeleton 
} from '@/camera/presentation/skeletons';

// Use individually
<CameraItemSkeleton />

// Or in lists
<CameraListSkeleton count={10} />
```

## Design Principles

### 1. **Structural Matching**
Each skeleton mirrors its corresponding component's exact structure:
- Same HTML hierarchy
- Same padding, margins, and spacing
- Same responsive breakpoints
- Same layout (flex, grid, etc.)

### 2. **Visual Consistency**
- Background color: `bg-gray-200` (Tailwind)
- Animation: `animate-pulse` (built-in Tailwind)
- Border radius: `rounded` (consistent with real components)
- Heights match actual content approximately

### 3. **Width Strategy**
- Use relative widths (`w-1/3`, `w-2/5`) for varied, natural look
- Full width (`w-full`) for inputs and containers
- Fixed widths (`w-20`, `w-24`) for badges and buttons
- Avoid making all elements the same width

### 4. **Performance**
- Pure presentational components (no state)
- Minimal DOM nodes
- CSS-only animations (no JavaScript)
- Reusable and composable

## Styling Details

### Colors
```css
bg-gray-200  /* Main skeleton color */
bg-gray-300  /* Borders (same as real components) */
```

### Animation
```css
animate-pulse  /* Tailwind's built-in pulse animation */
/* Alternates opacity between 100% and 50% */
```

### Common Heights
```css
h-4   /* Labels, small text */
h-6   /* Medium text, badges */
h-8   /* Large titles */
h-9   /* Page titles */
h-10  /* Input fields, buttons */
```

### Common Widths
```css
w-16, w-20, w-24  /* Small elements (badges, labels) */
w-32, w-40, w-48  /* Medium elements */
w-64              /* Large elements (titles) */
w-1/3, w-2/5      /* Relative widths for variety */
w-full            /* Full width containers */
```

## Best Practices

### ✅ Do
- Match the skeleton structure to the real component exactly
- Use `animate-pulse` for shimmer effect
- Keep skeleton components simple and stateless
- Use relative widths for natural variation
- Test skeleton appearance in both light and dark modes (if applicable)

### ❌ Don't
- Add complex logic or state to skeleton components
- Make skeletons too detailed (avoid text-like patterns)
- Use different spacing/layout than the real component
- Forget to handle responsive breakpoints
- Make all skeleton elements the same width

## Accessibility

Skeletons are purely visual and decorative:
- No ARIA labels needed (they're temporary)
- No tab stops or interactive elements
- Brief appearance (only during loading)
- Consider adding `aria-busy="true"` to parent container

## File Structure

```
presentation/
└── skeletons/
    ├── README.md
    ├── index.ts                       # Barrel export
    ├── camera-item.skeleton.tsx       # List item skeleton
    ├── camera-list.skeleton.tsx       # List container skeleton
    ├── camera-form.skeleton.tsx       # Form skeleton
    └── camera-detail.skeleton.tsx     # Detail page skeleton
```

## Benefits

### User Experience
- ✅ Immediate visual feedback
- ✅ Reduces perceived loading time
- ✅ Professional, polished appearance
- ✅ Maintains layout stability (no content jump)
- ✅ Sets user expectations

### Development
- ✅ Reusable components
- ✅ Easy to maintain (mirrors real components)
- ✅ Simple to implement (pure CSS)
- ✅ No external dependencies
- ✅ Works with any loading state

## Future Enhancements

Potential improvements for skeleton components:
1. **Shimmer direction** - Add left-to-right shimmer animation
2. **Dark mode** - Adjust colors for dark backgrounds
3. **Staggered animation** - Delay animation start for items
4. **Wave effect** - More sophisticated loading animation
5. **Custom timing** - Configurable animation duration

## Example: Before & After

### Before (Plain loading text)
```tsx
{isLoading ? (
  <p>Loading cameras...</p>
) : (
  <CameraList cameras={results} />
)}
```

### After (Skeleton)
```tsx
{isLoading ? (
  <CameraListSkeleton count={5} />
) : (
  <CameraList cameras={results} />
)}
```

## Summary

The skeleton system provides:
- **4 skeleton components** matching all camera UI components
- **173 total lines** of clean, reusable code
- **Zero dependencies** - pure Tailwind CSS
- **Full responsive** support
- **Professional UX** with minimal effort

These skeletons enhance the camera module's loading experience and serve as a pattern for all other modules.
