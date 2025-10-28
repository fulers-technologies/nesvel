# Custom React Hooks

A comprehensive collection of production-ready React hooks for the Nesvel UI library. All hooks are fully typed, SSR-safe, and thoroughly documented.

## Installation

```tsx
// Import individual hooks
import { useMediaQuery } from "@nesvel/ui/hooks/useMediaQuery"

// Or import from the main hooks index
import { useMediaQuery, useToggle } from "@nesvel/ui/hooks"
```

## Hooks Overview

### UI State Management

#### `useToggle`
Manage boolean state with convenient toggle functionality.

```tsx
const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false)
```

#### `useHover`
Detect hover state on DOM elements.

```tsx
const [ref, isHovered] = useHover<HTMLDivElement>()
```

#### `useClickOutside`
Detect clicks outside of a specified element.

```tsx
const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false))
```

### Data Persistence

#### `useLocalStorage`
Persist state in localStorage with cross-tab synchronization.

```tsx
const [theme, setTheme] = useLocalStorage("theme", "light")
```

#### `useCopyToClipboard`
Copy text to clipboard with feedback.

```tsx
const [{ success }, copy] = useCopyToClipboard()
await copy("Text to copy")
```

### Performance Optimization

#### `useDebounce`
Debounce values to reduce unnecessary updates.

```tsx
const debouncedSearch = useDebounce(searchTerm, 500)
```

#### `usePrevious`
Access the previous value of state or props.

```tsx
const prevCount = usePrevious(count)
```

### Responsive Design

#### `useMediaQuery`
Respond to CSS media queries in JavaScript.

```tsx
const isMobile = useMediaQuery("(max-width: 768px)")
```

#### `useWindowSize`
Track browser window dimensions.

```tsx
const { width, height } = useWindowSize()
```

### User Interactions

#### `useKeyPress`
Detect keyboard key presses with modifier support.

```tsx
const escapePressed = useKeyPress("Escape")
const ctrlS = useKeyPress("s", { ctrlKey: true })
```

#### `useScrollLock`
Lock/unlock body scroll for modals and drawers.

```tsx
useScrollLock(isModalOpen)
```

### Accessibility

#### `useFocusTrap`
Trap focus within an element for accessible modals.

```tsx
const modalRef = useFocusTrap<HTMLDivElement>(isOpen)
```

### Viewport Observations

#### `useIntersectionObserver`
Observe element visibility using Intersection Observer API.

```tsx
const [ref, entry] = useIntersectionObserver<HTMLImageElement>({
  threshold: 0.1,
  triggerOnce: true
})
```

### Notifications

#### `useToast`
Display toast notifications with various types.

```tsx
const toast = useToast()

toast.success("Saved successfully!")
toast.error("An error occurred")
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed to save"
})
```

### Platform Detection

#### `useIsMac`
Detect if the user is on a macOS device.

```tsx
const isMac = useIsMac()
return <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
```

#### `useIsMobile`
Detect if the viewport is mobile-sized with configurable breakpoint.

```tsx
const isMobile = useIsMobile(768)
return isMobile ? <MobileView /> : <DesktopView />
```

### SSR & Hydration

#### `useMounted`
Detect when a component has mounted (client-side only).

```tsx
const mounted = useMounted()
if (!mounted) return null
```

### DOM Observation

#### `useMutationObserver`
Observe DOM mutations with MutationObserver API.

```tsx
const ref = useRef<HTMLDivElement>(null)
useMutationObserver(ref, (mutations) => {
  console.log("DOM changed")
}, { childList: true })
```

## Features

- ✅ **Fully Typed** - Complete TypeScript support with comprehensive type definitions
- ✅ **SSR Safe** - All hooks work correctly with server-side rendering
- ✅ **Well Documented** - Each hook has detailed JSDoc comments with examples
- ✅ **Production Ready** - Tested and optimized for performance
- ✅ **Tree Shakeable** - Import only what you need
- ✅ **Accessibility First** - Hooks follow WCAG guidelines where applicable

## Best Practices

### Performance
- Use `useDebounce` for expensive operations triggered by user input
- Combine `useMediaQuery` with conditional rendering for responsive components
- Leverage `useIntersectionObserver` for lazy loading and infinite scroll

### Accessibility
- Always use `useFocusTrap` in modal dialogs
- Combine `useScrollLock` with modal components
- Use `useKeyPress` to implement keyboard shortcuts (Escape to close, etc.)

### State Management
- Use `useLocalStorage` for persisting user preferences
- Use `usePrevious` to compare current and previous values
- Use `useToggle` instead of `useState` for boolean flags

## Examples

### Responsive Modal Component

```tsx
function Modal({ isOpen, onClose, children }) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen)
  const escapePressed = useKeyPress("Escape")
  
  useScrollLock(isOpen)
  
  useEffect(() => {
    if (escapePressed && isOpen) {
      onClose()
    }
  }, [escapePressed, isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay">
      <div ref={modalRef} className={isMobile ? "mobile" : "desktop"}>
        {children}
      </div>
    </div>
  )
}
```

### Search Input with Debounce

```tsx
function SearchInput() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const prevQuery = usePrevious(debouncedQuery)
  
  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== prevQuery) {
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery, prevQuery])
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### Lazy Loading Images

```tsx
function LazyImage({ src, alt }) {
  const [ref, entry] = useIntersectionObserver<HTMLImageElement>({
    threshold: 0.1,
    triggerOnce: true
  })
  
  return (
    <img
      ref={ref}
      src={entry?.isIntersecting ? src : "placeholder.jpg"}
      alt={alt}
    />
  )
}
```

## Contributing

When adding new hooks:
1. Add comprehensive JSDoc comments with examples
2. Ensure SSR compatibility (check for `window`/`document`)
3. Include TypeScript type definitions
4. Add cleanup logic in useEffect return functions
5. Export from `index.ts`
6. Update this README with usage examples

## License

Part of the Nesvel UI library.
