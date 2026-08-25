import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 15;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get pages(): number[] {
    const from = Math.max(1, Math.min(this.page - 2, this.totalPages - 4));
    const to = Math.min(this.totalPages, from + 4);
    return Array.from({ length: to - from + 1 }, (_, index) => from + index);
  }

  goTo(target: number): void {
    if (target >= 1 && target <= this.totalPages && target !== this.page) this.pageChange.emit(target);
  }
}
