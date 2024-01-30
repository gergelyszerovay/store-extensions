import { Route } from '@angular/router';
import { ArticleListComponent_CS } from './article-list-ngrx-component-store/article-list-component-store.component';
import { ArticleListComponent_SS } from './article-list-ngrx-signal-store/article-list-signal-store.component';
import { ArticleListComponent_SSF } from './article-list-ngrx-signal-store-feature/article-list-signal-store-feature.component';

export const routes: Route[] = [
  { path: '', component: ArticleListComponent_SS },
  { path: 'article-list-component-store', component: ArticleListComponent_CS },
  { path: 'article-list-signal-store', component: ArticleListComponent_SS },
  { path: 'article-list-signal-store-with-feature', component: ArticleListComponent_SSF },
];
