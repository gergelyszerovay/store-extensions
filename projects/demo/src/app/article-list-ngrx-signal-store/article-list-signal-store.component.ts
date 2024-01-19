import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListSignalStore } from './article-list-signal-store.store'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { RouteParamsPaginatonState } from '../models/article-list.state';
import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article-list-ss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    UiArticleListComponent, UiPaginationComponent,
    HttpRequestStateErrorPipe
  ],
  providers: [ArticleListSignalStore],
  template: `
<ng-container *ngIf="store.httpRequestState() === 'FETCHING'">
  Loading...
</ng-container>
<ng-container *ngIf="store.httpRequestState() | httpRequestStateErrorPipe as errorMessage">
  {{ errorMessage }}
</ng-container>
<ng-container *ngIf="store.httpRequestState() === 'FETCHED'">
  <ng-container *ngIf="store.articles() as articles">
    <app-ui-article-list [articles]="articles"/>
  </ng-container>
  <ng-container *ngIf="store.pagination() as pagination">
    <app-ui-pagination
      [selectedPage]="pagination.selectedPage()"
      [totalPages]="pagination.totalPages()"
      (onPageSelected)="store.setSelectedPage($event); store.loadArticles();" />
  </ng-container>
</ng-container>
  `
})
export class ArticleListComponent_SS {
  readonly store = inject(ArticleListSignalStore);
  readonly route = inject(ActivatedRoute);

  constructor(
  ) {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(routeParams => {
      this.store.setPaginationSettings(routeParams);
      this.store.loadArticles();
    });
  }
}
