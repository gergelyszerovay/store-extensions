import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiArticleLisItemComponent } from './ui-article-list-item.component';
import {  Article, Articles } from '../models/article.model';

@Component({
  selector: 'app-ui-article-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    UiArticleLisItemComponent
  ],
  template: `
<app-ui-article-list-item
  *ngFor="let article of articles; trackBy: trackById" [article]="article"
></app-ui-article-list-item>
  `
})
export class UiArticleListComponent {
  @Input({ required: true }) articles!: Articles;

  trackById(index: number, article: Article): string {
    return article.slug;
  }
}
