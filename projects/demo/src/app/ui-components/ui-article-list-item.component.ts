import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-ui-article-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
<div class="article-preview" *ngIf="article">
  <div class="article-meta">
    <a href=""><img [src]="article.author.image" /></a>
    <div class="info">
      <a href="" class="author">{{ article.author.username }}</a>
      <span class="date">{{ article.createdAt | date: 'longDate' }}</span>
    </div>
    <button
      class="btn btn-sm pull-xs-right {{ article.favorited ? 'btn-outline-primary' : 'btn-primary' }}"
      (click)="toggleFavorite(article)">
      <i class="ion-heart"></i> {{ article.favoritesCount }}
    </button>
  </div>
  <a (click)="openArticle.emit(article.slug)" class="preview-link">
    <h1>{{ article.title }}</h1>
    <p>{{ article.description }}</p>
    <span>Read more...</span>
    <ul class="tag-list">
      <li class="tag-default tag-pill tag-outline"
        *ngFor="let tag of article.tagList">
        {{ tag }}
      </li>
    </ul>
  </a>
</div>
  `
})
export class UiArticleLisItemComponent {
  @Input({ required: true }) article!: Article;
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
