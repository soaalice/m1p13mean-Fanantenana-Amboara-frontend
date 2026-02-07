import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal-forms',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
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
