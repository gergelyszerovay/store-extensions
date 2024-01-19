import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule
  ],
  template: `
<ul class="pagination" *ngIf="pages.length > 1">
  <li
    class="page-item"
    *ngFor="let page of pages"
    [ngClass]="{ active: page === selectedPage }"
    (click)="onPageSelected.emit(page)"
  >
    <a class="page-link">{{ page + 1 }}</a>
  </li>
</ul>
  `
})
export class UiPaginationComponent implements OnChanges {
  @Input({ required: true }) selectedPage!: number;
  @Input({ required: true }) totalPages!: number;
  @Output() onPageSelected: EventEmitter<number> = new EventEmitter();

  protected pages: number[] = [];

  constructor(
  ) {
  }

  ngOnChanges(): void {
    if (this.totalPages <= 10) {
      this.pages = Array.from(new Array(this.totalPages), (x, i) => i);
    }
    else {
      this.pages = Array.from(new Array(Math.min(this.totalPages, 11)), (x, i) => i + Math.max(0, this.selectedPage - 5));
    }
  }
}
