import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { ArticleListSignalStore } from './article-list-signal-store.store';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { HttpRequestStateErrorPipe, HttpRequestStates } from '../services/articles.service';
import { LogSignalStoreState } from '@gergelyszerovay/signal-store-logger';

@Component({
  selector: 'app-article-list-ss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiArticleListComponent, UiPaginationComponent, HttpRequestStateErrorPipe],
  providers: [ArticleListSignalStore],
  template: `
    <h1 class="text-xl font-semibold my-4">SignalStore</h1>
    <!-- 👇 Main UI state: initial / fetching 📡 -->
    @if (
      store.httpRequestState() === HttpRequestStates.INITIAL ||
      store.httpRequestState() === HttpRequestStates.FETCHING
    ) {
      <div>Loading...</div>
    }
    <!-- 👇 Main UI state: fetched 📡 -->
    @if (store.httpRequestState() === HttpRequestStates.FETCHED) {
      <!-- 👇 Article list UI component -->
      <app-ui-article-list [articles]="store.articles()" />
      <!-- 👇 Pagination UI component -->
      <app-ui-pagination
        [selectedPage]="store.pagination().selectedPage"
        [totalPages]="store.pagination().totalPages"
        (onPageSelected)="store.setSelectedPage($event); store.loadArticles()"
      />
    }
    <!-- 👇 Main UI state: error 📡 -->
    @if (store.httpRequestState() | httpRequestStateErrorPipe; as errorMessage) {
      {{ errorMessage }}
    }
  `,
})
export class ArticleListComponent_SS {
  // we get these from the router, as we use withComponentInputBinding()
  selectedPage = input<string | undefined>(undefined);
  pageSize = input<string | undefined>(undefined);

  HttpRequestStates = HttpRequestStates;

  readonly store = inject(ArticleListSignalStore);

  constructor() {
    LogSignalStoreState('ArticleListSignalStore', this.store);
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
