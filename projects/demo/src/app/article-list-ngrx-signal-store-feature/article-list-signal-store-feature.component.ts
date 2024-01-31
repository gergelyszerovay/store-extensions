import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { HttpRequestStateErrorPipe } from '../services/articles.service';
import { LogSignalStoreState } from 'ngx-mock-signal-store';
import { ArticleListSignalStoreWithFeature } from './article-list-signal-store-with-feature.store';

@Component({
  selector: 'app-article-list-ssf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleListComponent, UiPaginationComponent,
    HttpRequestStateErrorPipe
  ],
  providers: [ArticleListSignalStoreWithFeature],
  template: `
<h3>SignalStore with a feature</h3>
@if (store.isLoadArticlesEmpty() || store.isLoadArticlesFetching()) {
  <div>Loading...</div>
}
@if (store.isLoadArticlesFetched()) {
  <app-ui-article-list [articles]="store.articles()"/>
  <app-ui-pagination
    [selectedPage]="store.pagination().selectedPage"
    [totalPages]="store.pagination().totalPages"
    (onPageSelected)="store.setSelectedPage($event); store.loadArticles();" />
}
@if (store.hasLoadArticlesError(); as errorMessage) {
  {{ errorMessage }}
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
      console.log('effect input', this.selectedPage(), this.pageSize());
      this.store.setSelectedPage(this.selectedPage());
      this.store.setPageSize(this.pageSize());
      untracked(() => {
        this.store.loadArticles();
      });
    }, { allowSignalWrites: true });
  }
}
