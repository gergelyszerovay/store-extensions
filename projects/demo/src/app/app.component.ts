import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UiArticleListComponent } from "./ui-components/ui-top-menu.component";

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
      RouterOutlet, RouterLink,
      UiArticleListComponent
  ],
  template: `
<div class="max-w-2xl mx-auto">
  <app-ui-top-menu [items]="menuItems"/>
  <router-outlet></router-outlet>
</div>
  `,

})
export class AppComponent {
  menuItems = [
    { slug: '/article-list-component-store', text: 'ComponentStore' },
    { slug: '/article-list-signal-store', text: 'SignalStore' },
    { slug: '/article-list-signal-store-with-feature', text: 'SignalStore with a feature' },
  ];
 }
