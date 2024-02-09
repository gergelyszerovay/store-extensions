import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { LogSignalStoreState } from '@gergelyszerovay/signal-store-logger';
import { ArticleListSignalStoreWithFeature } from './article-list-signal-store-with-feature.store';

@Component({
  selector: 'app-article-list-ssf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiArticleListComponent, UiPaginationComponent],
  providers: [ArticleListSignalStoreWithFeature],
  template: ` <h1 class="text-xl font-semibold my-4">SignalStore with a feature</h1>
    <!-- 👇 Main UI state: initial / fetching 📡 -->
    @if (store.isLoadArticlesInitial() || store.isLoadArticlesFetching()) {
      <div>Loading...</div>
    }
    <!-- 👇 Main UI state: fetched 📡 -->
    @if (store.isLoadArticlesFetched()) {
      <!-- 👇 Article list UI component -->
      <app-ui-article-list
        [articles]="store.articleEntities()"
        (toggleFavorite)="store.toggleFavorite($event)"
      />
      <!-- 👇 Pagination UI component -->
      <app-ui-pagination
        [selectedPage]="store.pagination().selectedPage"
        [totalPages]="store.pagination().totalPages"
        (onPageSelected)="store.setSelectedPage($event); store.loadArticles()"
      />
    }
    <!-- 👇 Main UI state: error 📡 -->
    @if (store.getLoadArticlesError(); as error) {
      {{ error.errorMessage }}
    }`,
})
export class ArticleListComponent_SSF {
  // we get these from the router, as we use withComponentInputBinding()
  selectedPage = input<string | undefined>(undefined);
  pageSize = input<string | undefined>(undefined);

  readonly store = inject(ArticleListSignalStoreWithFeature);

  constructor() {
    LogSignalStoreState('ArticleListSignalStoreWithFeature', this.store);

    effect(() => {
      // 1️⃣ the effect() tracks this two signals only
      const selectedPage = this.selectedPage();
      const pageSize = this.pageSize();
      // 2️⃣ we wrap the function we want to execute on signal change
      // with an untracked() function
      untracked(() => {
        // 👈
        // we don't want to track anything in this block
        this.store.setSelectedPage(selectedPage);
        this.store.setPageSize(pageSize);
        this.store.loadArticles();
      });
      console.log('router inputs ➡️ store (effect)', selectedPage, pageSize);
    });
  }
}
