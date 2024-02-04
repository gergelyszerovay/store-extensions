import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { LogSignalStoreState } from '@gergelyszerovay/signal-store-logger';
import { ArticleListSignalStoreWithFeature } from './article-list-signal-store-with-feature.store';

@Component({
  selector: 'app-article-list-ssf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleListComponent, UiPaginationComponent
  ],
  providers: [ArticleListSignalStoreWithFeature],
  template: `
<h1 class="text-xl font-semibold my-4">SignalStore with a feature</h1>
@if (store.isLoadArticlesEmpty() || store.isLoadArticlesFetching()) {
  <div>Loading...</div>
}
@if (store.isLoadArticlesFetched()) {
  <app-ui-article-list
    [articles]="store.articleEntities()"
    (toggleFavorite)="store.toggleFavorite($event)"
  />
  <app-ui-pagination
    [selectedPage]="store.pagination().selectedPage"
    [totalPages]="store.pagination().totalPages"
    (onPageSelected)="store.setSelectedPage($event); store.loadArticles();"
  />
}
@if (store.getLoadArticlesError(); as error) {
  {{ error.errorMessage }}
}
  `
})
export class ArticleListComponent_SSF {
  // we get these from the router, as we use withComponentInputBinding()
  selectedPage = input<string | undefined>(undefined);
  pageSize = input<string | undefined>(undefined);

  readonly store = inject(ArticleListSignalStoreWithFeature);

  constructor(
  ) {
    LogSignalStoreState('ArticleListSignalStoreWithFeature', this.store);

    effect(() => {
      // the effect track these signals
      const selectedPage = this.selectedPage();
      const pageSize = this.pageSize();
      console.log('router input ➡️ store (effect)', selectedPage, pageSize);
      // we don't want to track anything from this line
      untracked(() => {
        this.store.setSelectedPage(selectedPage);
        this.store.setPageSize(pageSize);
        this.store.loadArticles();
      });
    });
  }
}
