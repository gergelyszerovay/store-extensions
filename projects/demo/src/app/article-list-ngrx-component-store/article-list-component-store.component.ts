import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponentStore } from './article-list-component-store.store';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-article-list-cs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    UiArticleListComponent, UiPaginationComponent,
    HttpRequestStateErrorPipe
  ],
  providers: [ArticleListComponentStore],
  template: `
<ng-container *ngIf="(store.httpRequestState$ | async) === 'FETCHING'">
  Loading...
</ng-container>
<ng-container *ngIf="store.httpRequestState$ | async | httpRequestStateErrorPipe as errorMessage">
  {{ errorMessage }}
</ng-container>
<ng-container *ngIf="(store.httpRequestState$ | async) === 'FETCHED'">
  <ng-container *ngIf="store.articles$ | async as articles">
    <app-ui-article-list [articles]="articles"/>
  </ng-container>
  <ng-container *ngIf="store.pagination$ | async as pagination">
    <app-ui-pagination
      [selectedPage]="pagination.selectedPage"
      [totalPages]="pagination.totalPages"
      (onPageSelected)="store.setSelectedPage($event); store.loadArticles();" />
  </ng-container>
</ng-container>
  `
})
export class ArticleListComponent_CS {
  readonly store = inject(ArticleListComponentStore);
  readonly route = inject(ActivatedRoute);

  constructor(
  ) {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(routeParams => {
      this.store.setPaginationSettings(routeParams);
      this.store.loadArticles();
    });
  }
}
