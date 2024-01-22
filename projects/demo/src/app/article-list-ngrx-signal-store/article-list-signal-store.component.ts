import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChange, SimpleChanges, effect, inject, input, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListSignalStore } from './article-list-signal-store.store'
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { LogSignalStoreState } from 'ngx-mock-signal-store';
import { patchState } from '@ngrx/signals';

@Component({
  selector: 'app-article-list-ss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleListComponent, UiPaginationComponent,
    HttpRequestStateErrorPipe
  ],
  providers: [ArticleListSignalStore],
/*
Main UI states: fetching, fetched, error
Pagination: Inputs / outputs
Component input triggered effect
*/
  template: `
  <pre>{{store.httpRequestState()}}</pre>
@if (store.httpRequestState() === 'EMPTY' || store.httpRequestState() === 'FETCHING') {
  <div>Loading...</div>
}
@if (store.httpRequestState() === 'FETCHED') {
  <app-ui-article-list [articles]="store.articles()"/>
  <app-ui-pagination
    [selectedPage]="store.pagination().selectedPage"
    [totalPages]="store.pagination().totalPages"
    (onPageSelected)="store.setSelectedPage($event); store.loadArticles();" />
}
@if (store.httpRequestState() | httpRequestStateErrorPipe; as errorMessage) {
  {{ errorMessage }}
}
  `
})
export class ArticleListComponent_SS {
  selectedPage = input<string | undefined>(undefined);
  pageSize = input<string | undefined>(undefined);

  readonly store = inject(ArticleListSignalStore);

  constructor(
  ) {
    LogSignalStoreState('ArticleListSignalStore', this.store);
    effect(() => {
      console.log('effect loadArticles', this.selectedPage(), this.pageSize());
      this.store.setSelectedPage(this.selectedPage());
      this.store.setPageSize(this.pageSize());
      this.store.loadArticles();
    }, { allowSignalWrites: true });
  }
}
