# Hooks Summary

Complete list of all custom React hooks available in the Nesvel UI library.

## Total Count: 18 Hooks

### ✅ Original Hooks (14)

1. **useClickOutside** - Detect clicks outside an element
2. **useCopyToClipboard** - Copy text to clipboard with feedback
3. **useDebounce** - Debounce values for performance
4. **useFocusTrap** - Trap focus for accessibility
5. **useHover** - Detect hover state on elements
6. **useIntersectionObserver** - Observe element visibility
7. **useKeyPress** - Detect keyboard key presses
8. **useLocalStorage** - Persist state in localStorage
9. **useMediaQuery** - Respond to CSS media queries
10. **usePrevious** - Access previous state/prop values
11. **useScrollLock** - Lock body scroll for modals
12. **useToast** - Display toast notifications
13. **useToggle** - Boolean state management
14. **useWindowSize** - Track window dimensions

### ✨ From shadcn-ui (4)

15. **useIsMac** - Detect macOS platform
16. **useIsMobile** - Detect mobile viewport
17. **useMounted** - Detect component mount state
18. **useMutationObserver** - Observe DOM mutations

## Hook Categories

### 🎨 UI State Management (3)
- `useToggle` - Boolean state with helpers
- `useHover` - Hover state detection
- `useClickOutside` - Outside click detection

### 💾 Data Persistence (2)
- `useLocalStorage` - localStorage with sync
- `useCopyToClipboard` - Clipboard operations

### ⚡ Performance (2)
- `useDebounce` - Value debouncing
- `usePrevious` - Previous value tracking

### 📱 Responsive Design (3)
- `useMediaQuery` - Media query matching
- `useWindowSize` - Window dimensions
- `useIsMobile` - Mobile detection

### 🎮 User Interactions (2)
- `useKeyPress` - Keyboard shortcuts
- `useScrollLock` - Scroll locking

### ♿ Accessibility (1)
- `useFocusTrap` - Focus management

### 👁️ Viewport Observation (1)
- `useIntersectionObserver` - Visibility detection

### 🔔 Notifications (1)
- `useToast` - Toast messages

### 🖥️ Platform Detection (1)
- `useIsMac` - macOS detection

### 🌐 SSR & Hydration (1)
- `useMounted` - Mount state detection

### 🔍 DOM Observation (1)
- `useMutationObserver` - DOM change detection

## Quick Reference

### Import Syntax

```tsx
// Named imports from main index
import { useMediaQuery, useToggle, useToast } from "@nesvel/ui/hooks"

// Individual imports
import { useMediaQuery } from "@nesvel/ui/hooks/useMediaQuery"
```

### Common Patterns

#### Responsive Layout
```tsx
const isMobile = useIsMobile()
const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)")
```

#### Modal Component
```tsx
const modalRef = useFocusTrap<HTMLDivElement>(isOpen)
useScrollLock(isOpen)
const escPressed = useKeyPress("Escape")
```

#### Platform-Specific UI
```tsx
const isMac = useIsMac()
const shortcut = isMac ? "⌘K" : "Ctrl+K"
```

#### SSR-Safe Rendering
```tsx
const mounted = useMounted()
if (!mounted) return <Skeleton />
```

## Features Checklist

- ✅ Full TypeScript support
- ✅ SSR-safe (all hooks)
- ✅ Comprehensive JSDoc comments
- ✅ Multiple usage examples per hook
- ✅ Proper cleanup (no memory leaks)
- ✅ Tree-shakeable exports
- ✅ WCAG compliant (accessibility hooks)
- ✅ Performance optimized
- ✅ Cross-browser compatible
- ✅ Production-ready

## Documentation

Each hook includes:
- 📖 Detailed description
- 🎯 Use cases
- 📝 3-5 code examples
- 💡 Best practices
- ⚠️ Important remarks
- 🔧 TypeScript types

## Testing Recommendations

### Essential Tests
1. **SSR Safety**: All hooks should not crash during SSR
2. **Cleanup**: Verify useEffect cleanup functions
3. **Type Safety**: Ensure TypeScript compilation
4. **Browser APIs**: Check for proper feature detection

### Suggested Test Coverage
- Unit tests for pure logic hooks (useDebounce, usePrevious, useToggle)
- Integration tests for DOM-dependent hooks
- E2E tests for user interaction hooks (useKeyPress, useClickOutside)

## Performance Notes

### Optimized Hooks
- `useDebounce` - Reduces re-renders
- `useMediaQuery` - Uses native matchMedia
- `useIntersectionObserver` - Efficient visibility tracking

### Hooks That May Need Debouncing
- `useWindowSize` - Fires frequently on resize
- `useMutationObserver` - Can fire many times for DOM changes

## Browser Support

All hooks support:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Polyfills Required
- None (all hooks include fallbacks)

## Contributing

When adding new hooks:
1. Follow naming convention: `use[FeatureName]`
2. Add comprehensive JSDoc with examples
3. Ensure SSR compatibility
4. Include TypeScript types
5. Add cleanup in useEffect
6. Export from `index.ts`
7. Update README.md
8. Add to this summary

## License

Part of the Nesvel UI library.
