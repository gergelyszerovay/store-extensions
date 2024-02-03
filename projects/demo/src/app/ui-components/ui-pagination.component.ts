import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, computed, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixChevronLeft, radixChevronRight } from '@ng-icons/radix-icons';

@Component({
  selector: 'app-ui-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({ radixChevronLeft, radixChevronRight })],
  template: `
    <nav
      role="navigation"
      aria-label="pagination"
      class="mx-auto flex justify-center  rounded-md pb-4"
    >
      <ul class="flex flex-row items-center gap-1 rounded-md bg-yellow-400 p-1">
        <li class="">
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium  disabled:pointer-events-none disabled:opacity-50 hover:bg-yellow-500    h-10 px-4 py-2 gap-1 pl-2.5"
            aria-label="Go to previous page"
            href="#"
            [disabled]="selectedPage() === 0"
            ><ng-icon name="radixChevronLeft"/><span>Previous</span></button
          >
        </li>
        @for (page of pages(); track page) {
          <li class="">
            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium  disabled:pointer-events-none disabled:opacity-50 hover:bg-yellow-500 h-10 w-8 {{ selectedPage() === page ? 'border border-black bg-background' : '' }}"
              href="#"
              (click)="onPageSelected.emit(page)"
              >{{page + 1}}</button
            >
          </li>
        }
        <li class="">
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium  disabled:pointer-events-none disabled:opacity-50 hover:bg-yellow-500 h-10 px-4 py-2 gap-1 pr-2.5"
            aria-label="Go to next page"
            href="#"
            [disabled]="selectedPage() === totalPages() - 1"
            ><span>Next</span
            ><ng-icon name="radixChevronRight"/></button>
        </li>
      </ul>
    </nav>
  `,
})
export class UiPaginationComponent implements OnChanges {
  selectedPage = input.required<number>();
  totalPages = input.required<number>();
  maxItems = input(7);
  @Output() onPageSelected: EventEmitter<number> = new EventEmitter();

  pages = computed(() => {
    console.log(this.selectedPage(), this.totalPages())
    return calculatePaginatorPages(this.totalPages() - 1, this.selectedPage(), this.maxItems());
  });

  constructor() {}

  ngOnChanges(): void {
  }
}


function calculatePaginatorPages(totalPages: number, selectedPage: number, pagesToShow: number): number[] {
  const pages: number[] = [];

  // Handle edge cases
  if (totalPages <= 1) {
    return pages;
  }

  if (totalPages <= pagesToShow) {
    // If totalPages is less than or equal to the number of pages to show, display all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // If totalPages is greater than the number of pages to show
    const half = Math.floor(pagesToShow / 2);

    if (selectedPage >= totalPages - half) {
      // Display the last 'pagesToShow' pages if selectedPage is in the last half
      for (let i = totalPages - pagesToShow + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (selectedPage <= half + 1) {
      // Display the first 'pagesToShow' pages if selectedPage is in the first half
      for (let i = 0; i < pagesToShow; i++) {
        pages.push(i);
      }
    } else {
      // Display pages around the selectedPage
      const start = selectedPage - half;
      const end = selectedPage + half;

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
  }

  return pages;
}
