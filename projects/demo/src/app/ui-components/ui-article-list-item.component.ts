import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-ui-article-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
@if (article(); as a) {
  <div class="article-preview">
    <div class="article-meta">
      <a href=""><img [src]="a.author.image" /></a>
      <div class="info">
        <a href="" class="author">{{ a.author.username }}</a>
        <span class="date">{{ a.createdAt | date: 'longDate' }}</span>
      </div>
      <button
        class="btn btn-sm pull-xs-right {{ a.favorited ? 'btn-outline-primary' : 'btn-primary' }}"
        (click)="toggleFavorite(a)">
        <i class="ion-heart"></i> {{ a.favoritesCount }}
      </button>
    </div>
    <a (click)="openArticle.emit(a.slug)" class="preview-link">
      <h1>{{ a.title }}</h1>
      <p>{{ a.description }}</p>
      <span>Read more...</span>
      <ul class="tag-list">
        @for (tag of a.tagList; track $index) {
          <li class="tag-default tag-pill tag-outline">
            {{ tag }}
          </li>
        }
      </ul>
    </a>
  </div>
}
  `
})
export class UiArticleLisItemComponent {
  article = input.required<Article>();
  @Output() openArticle: EventEmitter<string> = new EventEmitter();
  @Output() favorite: EventEmitter<string> = new EventEmitter();
  @Output() unFavorite: EventEmitter<string> = new EventEmitter();

  toggleFavorite(article: Article) {
    if (article.favorited) {
      this.unFavorite.emit(article.slug);
    } else {
      this.favorite.emit(article.slug);
    }
  }
}
