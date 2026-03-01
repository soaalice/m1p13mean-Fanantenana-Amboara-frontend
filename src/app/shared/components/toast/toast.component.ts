import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ToastData, TOAST_ICONS } from '../../models/toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit, OnDestroy {
  readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  readonly snackBarRef = inject(MatSnackBarRef<ToastComponent>);

  readonly icon = TOAST_ICONS[this.data.type];
  readonly progress = signal(100);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly duration = this.data.duration ?? 4000;

  ngOnInit(): void {
    if (this.duration > 0) {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  dismiss(): void {
    this.snackBarRef.dismissWithAction();
  }

  handleAction(): void {
    this.data.onAction?.();
    this.snackBarRef.dismissWithAction();
  }

  private startCountdown(): void {
    const tickMs = 50;
    const totalTicks = this.duration / tickMs;
    let ticks = 0;

    this.intervalId = setInterval(() => {
      ticks++;
      const remaining = Math.max(0, 100 - (ticks / totalTicks) * 100);
      this.progress.set(remaining);

      if (remaining === 0) {
        this.clearInterval();
        this.snackBarRef.dismiss();
      }
    }, tickMs);
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
