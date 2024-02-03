import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponentStore } from './article-list-component-store.store';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

function readFirstSync<T>(o: Observable<T>): T | undefined {
  let result: T | undefined = undefined;
  o.pipe(take(1)).subscribe(v => { result = v });
  return result;
}

@Component({
  selector: 'app-article-list-cs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    UiArticleListComponent, UiPaginationComponent,
    HttpRequestStateErrorPipe
  ],
  providers: [
    ArticleListComponentStore
  ],
  template: `
<h1 class="text-xl font-semibold my-4">ComponentStore</h1>
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
  readonly store = inject( ArticleListComponentStore);
  readonly route = inject(ActivatedRoute);

  constructor(
  ) {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(routeParams => {
      this.store.setPaginationSettings(routeParams);
      this.store.loadArticles();
    });
    this.store.loadArticles();

    // const store = this.store;
    // const m = asMockComponentStore(store);

    // m.articlesCount$.next(5);

    // console.log(5, readFirstSync(m.articlesCount$));

    // m.$articlesCount.set(6)

    // console.log(6, m.$articlesCount())

    // const o = new Subject<string>();
    // store.setRequestStateError(o);

    // console.log(0, m.setRequestStateError[FAKE_RX_CS].callCount);
    // store.setRequestStateError('error1');
    // console.log(1, m.setRequestStateError[FAKE_RX_CS].callCount);
    // o.next('error2');
    // console.log(2, m.setRequestStateError[FAKE_RX_CS].callCount);

    // const o2 = new Subject<void>();
    // store.loadArticles(o2);

    // console.log(0, m.loadArticles[FAKE_RX_CS].callCount);
    // store.loadArticles();
    // console.log(1, m.loadArticles[FAKE_RX_CS].callCount);
    // o2.next();
    // console.log(2, m.loadArticles[FAKE_RX_CS].callCount);

  }
}
