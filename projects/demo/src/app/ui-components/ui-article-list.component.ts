import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { UiArticleLisItemComponent } from './ui-article-list-item.component';
import { Articles } from '../models/article.model';

@Component({
  selector: 'app-ui-article-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleLisItemComponent
  ],
  template: `
@for (article of articles(); track article.id) {
  <app-ui-article-list-item
    [article]="article"
    (toggleFavorite)="toggleFavorite.emit($event)"
  />
}
  `
})
export class UiArticleListComponent {
  articles = input.required<Articles>();
  @Output() toggleFavorite = new EventEmitter<number>();
}
