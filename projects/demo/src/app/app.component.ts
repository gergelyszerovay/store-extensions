import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    RouterOutlet, RouterLink
  ],
  selector: 'app-root',
  template: `
<div>
  <a routerLink="/article-list-component-store">article-list-component-store</a> |
  <a routerLink="/article-list-signal-store">article-list-signal-store</a>
</div>
<router-outlet></router-outlet>
   `
})
export class AppComponent { }
