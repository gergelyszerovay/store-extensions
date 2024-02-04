import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ui-top-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink
  ],
  template: `
<nav class="bg-yellow-400 rounded-md p-4 mt-4">
  <div class="container mx-auto flex justify-center">
    <!-- Menu Items -->
    <ul class="flex space-x-6">
    @for (item of items(); track item.slug) {
      <li><a [routerLink]="item.slug" class="text-gray-800 hover:text-yellow-600 font-semibold">{{item.text}}</a></li>
    }
    </ul>
  </div>
</nav>
  `
})
export class UiTopMenuComponent {
  items = input.required<{ slug: string, text: string}[]>();
}
