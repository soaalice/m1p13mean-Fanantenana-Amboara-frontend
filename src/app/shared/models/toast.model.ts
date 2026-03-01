export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  type: ToastType;
  title?: string;
  message: string;
  /** Duration in ms. Use 0 for persistent. Default: 4000 */
  duration?: number;
  /** Label for the dismiss/action button */
  actionLabel?: string;
  /** Callback fired when the action button is clicked */
  onAction?: () => void;
}

export interface ToastConfig {
  defaultDuration: number;
  maxStack: number;
}

export const TOAST_DEFAULT_CONFIG: ToastConfig = {
  defaultDuration: 4000,
  maxStack: 3,
};

export const TOAST_ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'cancel',
  warning: 'warning',
  info: 'info',
};
