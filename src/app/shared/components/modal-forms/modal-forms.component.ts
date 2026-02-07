import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-forms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-forms.component.html',
  styleUrl: './modal-forms.component.scss'
})
export class ModalFormsComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onBackdropClick(): void {
    this.close.emit();
  }
}
