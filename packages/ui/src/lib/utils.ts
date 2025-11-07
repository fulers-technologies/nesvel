import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge and deduplicate Tailwind CSS classes
 *
 * This function combines multiple class values and intelligently merges
 * Tailwind CSS classes to avoid conflicts and duplication.
 *
 * @param inputs - Class values to merge (strings, arrays, objects, etc.)
 * @returns Merged and deduplicated class string
 *
 * @example
 * ```ts
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6' (px-6 overrides px-4)
 * cn('text-red-500', condition && 'text-blue-500') // Conditional classes
 * cn({ 'bg-blue-500': true, 'text-white': false }) // Object syntax
 * ```
 *
 * @remarks
 * - Uses `clsx` to handle conditional classes and various input formats
 * - Uses `twMerge` to intelligently merge Tailwind classes (later classes override earlier ones)
 * - Perfect for component prop className merging: `cn(baseClasses, className)`
 *
 * @see https://github.com/lukeed/clsx
 * @see https://github.com/dcastil/tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
