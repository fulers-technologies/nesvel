'use client';

import { toast as sonnerToast } from 'sonner';

/**
 * Type definition for toast options.
 * Extends the base Sonner toast options with additional functionality.
 */
type ToastOptions = {
  /** The title/message of the toast */
  title?: string;
  /** Additional description text */
  description?: string;
  /** Duration in milliseconds before the toast auto-dismisses */
  duration?: number;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };

  /** Cancel button configuration */
  cancel?: {
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };

  /** Whether the toast can be dismissed by clicking */
  dismissible?: boolean;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
  /** Callback when toast auto-closes */
  onAutoClose?: () => void;
};

/**
 * Custom hook that provides a convenient interface for displaying toast notifications.
 *
 * This hook wraps the Sonner toast library used by the Toaster component,
 * providing a consistent API for showing success, error, info, warning,
 * loading, and promise-based toasts throughout your application.
 *
 * @returns An object containing methods for displaying different types of toasts
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast()
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData()
 *       toast.success("Data saved successfully!")
 *     } catch (error: Error | any) {
 *       toast.error("Failed to save data", {
 *         description: error.message
 *       })
 *     }
 *   }
 *
 *   return <button onClick={handleSave}>Save</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Promise-based toast with loading state
 * const handleSubmit = async () => {
 *   toast.promise(
 *     submitForm(),
 *     {
 *       loading: "Submitting form...",
 *       success: "Form submitted successfully!",
 *       error: "Failed to submit form"
 *     }
 *   )
 * }
 * ```
 *
 * @remarks
 * Requires the Toaster component to be mounted in your app root.
 * The toast will respect the theme (light/dark) from next-themes.
 */
export function useToast() {
  /**
   * Display a success toast notification.
   *
   * @param message - The main message to display
   * @param options - Additional toast options
   * @returns Toast ID that can be used to dismiss the toast programmatically
   */
  const success = (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
      dismissible: options?.dismissible,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display an error toast notification.
   *
   * @param message - The error message to display
   * @param options - Additional toast options
   * @returns Toast ID that can be used to dismiss the toast programmatically
   */
  const error = (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
      dismissible: options?.dismissible,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display an info toast notification.
   *
   * @param message - The info message to display
   * @param options - Additional toast options
   * @returns Toast ID that can be used to dismiss the toast programmatically
   */
  const info = (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
      dismissible: options?.dismissible,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display a warning toast notification.
   *
   * @param message - The warning message to display
   * @param options - Additional toast options
   * @returns Toast ID that can be used to dismiss the toast programmatically
   */
  const warning = (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
      dismissible: options?.dismissible,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display a loading toast notification.
   * Useful for indicating ongoing operations.
   *
   * @param message - The loading message to display
   * @param options - Additional toast options
   * @returns Toast ID that can be used to dismiss or update the toast
   */
  const loading = (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      duration: options?.duration,
      dismissible: options?.dismissible,
    });
  };

  /**
   * Display a promise-based toast that automatically updates based on promise state.
   *
   * Shows a loading state while the promise is pending, then automatically
   * transitions to success or error state when the promise resolves or rejects.
   *
   * @param promise - The promise to track
   * @param messages - Messages for each state (loading, success, error)
   * @returns The original promise (allows chaining)
   */
  const promise = <T>(
    promiseOrFunction: Promise<T> | (() => Promise<T>),
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promiseOrFunction, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  /**
   * Display a custom toast notification.
   * Use this for basic messages without a specific type.
   *
   * @param message - The message to display
   * @param options - Additional toast options
   * @returns Toast ID that can be used to dismiss the toast programmatically
   */
  const custom = (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel,
      dismissible: options?.dismissible,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Dismiss a specific toast by its ID.
   *
   * @param toastId - The ID of the toast to dismiss (returned from toast methods)
   */
  const dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    custom,
    dismiss,
  };
}
