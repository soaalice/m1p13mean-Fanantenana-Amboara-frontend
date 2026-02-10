import { Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-list-filters',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './list-filters.component.html',
  styleUrl: './list-filters.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ListFiltersComponent {
  @Input() showApply = false;
  @Input() showReset = true;
  @Input() applyLabel = 'Apply';
  @Input() resetLabel = 'Reset';

  @Output() apply = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}
