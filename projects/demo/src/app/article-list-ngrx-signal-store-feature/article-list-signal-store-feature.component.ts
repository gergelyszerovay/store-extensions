import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
// import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { LogSignalStoreState } from 'ngx-signal-store-logger';
import { ArticleListSignalStoreWithFeature } from './article-list-signal-store-with-feature.store';

@Component({
  selector: 'app-article-list-ssf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleListComponent, UiPaginationComponent,
    // HttpRequestStateErrorPipe
  ],
  providers: [ArticleListSignalStoreWithFeature],
  template: `
<h1 class="text-xl font-semibold my-4">SignalStore with a feature</h1>
@if (store.isLoadArticlesEmpty() || store.isLoadArticlesFetching()) {
  <div>Loading...</div>
}
@if (store.isLoadArticlesFetched()) {
  <app-ui-article-list [articles]="store.articleEntities()"/>
  <app-ui-pagination
    [selectedPage]="store.pagination().selectedPage"
    [totalPages]="store.pagination().totalPages"
    (onPageSelected)="store.setSelectedPage($event); store.loadArticles();" />
}
@if (store.getLoadArticlesError(); as error) {
  {{ error.errorMessage }}
}
  `
})
export class ArticleListComponent_SSF {
  selectedPage = input<string | undefined>(undefined);
  pageSize = input<string | undefined>(undefined);

  readonly store = inject(ArticleListSignalStoreWithFeature);

  constructor(
  ) {
    LogSignalStoreState('ArticleListSignalStoreWithFeature', this.store);

    effect(() => {
      const selectedPage = this.selectedPage();
      const pageSize = this.pageSize();
      untracked(() => {
        console.log('effect input', selectedPage, pageSize);
        this.store.setSelectedPage(selectedPage);
        this.store.setPageSize(pageSize);
        this.store.loadArticles();
      });
    }, { allowSignalWrites: true });
  }
}
