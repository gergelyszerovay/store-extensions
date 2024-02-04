import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { ArticleListSignalStore } from './article-list-signal-store.store'
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { LogSignalStoreState } from '@gergelyszerovay/signal-store-logger';

@Component({
  selector: 'app-article-list-ss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleListComponent, UiPaginationComponent,
    HttpRequestStateErrorPipe
  ],
  providers: [ArticleListSignalStore],
  template: `
<h1 class="text-xl font-semibold my-4">SignalStore</h1>
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
  // we get these from the router, as we use withComponentInputBinding()
  selectedPage = input<string | undefined>(undefined);
  pageSize = input<string | undefined>(undefined);

  readonly store = inject(ArticleListSignalStore);

  constructor(
  ) {
    LogSignalStoreState('ArticleListSignalStore', this.store);
    effect(() => {
      // the effect track these signals
      const selectedPage = this.selectedPage();
      const pageSize = this.pageSize();
      // we don't want to track anything from this line
      console.log('router input ➡️ store (effect)', selectedPage, pageSize);
      untracked(() => {
        this.store.setSelectedPage(selectedPage);
        this.store.setPageSize(pageSize);
        this.store.loadArticles();
      });
    });
  }
}
