import { inject, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import {
  TOAST_DEFAULT_CONFIG,
  ToastConfig,
  ToastData,
  ToastType,
} from '../../shared/models/toast.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';

export type ToastOptions = Omit<ToastData, 'type' | 'message'>;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly config: ToastConfig = { ...TOAST_DEFAULT_CONFIG };

  /** Stack of currently open snack bar refs */
  private readonly stack: MatSnackBarRef<ToastComponent>[] = [];

  // ── Shorthand methods ─────────────────────────────────────

  success(message: string, options?: ToastOptions): MatSnackBarRef<ToastComponent> {
    return this.open({ type: 'success', message, ...options });
  }

  error(message: string, options?: ToastOptions): MatSnackBarRef<ToastComponent> {
    return this.open({
      type: 'error',
      message,
      // Errors stay longer by default
      duration: options?.duration ?? 6000,
      ...options,
    });
  }

  warning(message: string, options?: ToastOptions): MatSnackBarRef<ToastComponent> {
    return this.open({ type: 'warning', message, ...options });
  }

  info(message: string, options?: ToastOptions): MatSnackBarRef<ToastComponent> {
    return this.open({ type: 'info', message, ...options });
  }

  /** Generic open. Prefer the shorthand methods. */
  open(data: ToastData): MatSnackBarRef<ToastComponent> {
    this.enforceMaxStack();

    const duration = data.duration ?? this.config.defaultDuration;
    const matConfig: MatSnackBarConfig<ToastData> = {
      data: { ...data, duration },
      // We drive dismissal via the progress bar in the component,
      // so we set MatSnackBar duration to 0 (persistent) when duration > 0
      // to avoid the double-dismiss race.
      duration: 0,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['toast-panel', `toast-panel--${data.type}`],
    };

    const ref = this.snackBar.openFromComponent(ToastComponent, matConfig);

    this.stack.push(ref);

    ref.afterDismissed().subscribe(() => {
      const idx = this.stack.indexOf(ref);
      if (idx !== -1) {
        this.stack.splice(idx, 1);
      }
    });

    return ref;
  }

  /** Dismiss all open toasts immediately. */
  dismissAll(): void {
    // Slice to avoid mutation while iterating
    [...this.stack].forEach((ref) => ref.dismiss());
  }

  /** Override default service configuration at runtime. */
  configure(config: Partial<ToastConfig>): void {
    Object.assign(this.config, config);
  }

  // ── Internals ─────────────────────────────────────────────

  private enforceMaxStack(): void {
    if (this.stack.length >= this.config.maxStack) {
      // Dismiss the oldest toast to make room
      this.stack[0]?.dismiss();
    }
  }
}
