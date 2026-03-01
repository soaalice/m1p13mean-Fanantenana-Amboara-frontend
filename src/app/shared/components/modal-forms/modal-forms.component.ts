import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal-forms',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './modal-forms.component.html',
  styleUrl: './modal-forms.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalFormsComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  /** Référence sur le div `.modal-backdrop` défini dans le template. */
  @ViewChild('backdropEl') backdropEl!: ElementRef<HTMLElement>;

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    // Téléporter le backdrop au niveau de <body> pour s'affranchir du
    // contexte d'empilement créé par mat-drawer-content.
    const el = this.backdropEl?.nativeElement;
    if (el) {
      document.body.appendChild(el);
    }
  }

  ngOnDestroy(): void {
    // Nettoyage : retirer le nœud DOM du body.
    const el = this.backdropEl?.nativeElement;
    if (el?.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  onBackdropClick(): void {
    this.close.emit();
  }
}
