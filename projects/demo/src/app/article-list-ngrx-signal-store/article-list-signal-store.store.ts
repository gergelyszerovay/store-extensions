import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap, lastValueFrom } from 'rxjs';
import { ArticleListState, RouteParamsPaginatonState, initialArticleListState } from '../models/article-list.state';
import { ArticlesService, ArticlesResponseType } from '../services/articles.service';
import { tapResponse } from '@ngrx/component-store';
import { HttpErrorResponse } from '@angular/common/http';

export const ArticleListSignalStore = signalStore(
  // { debugId: 'ArticleListSignalStore' },
  withState<ArticleListState>(initialArticleListState),
  withComputed(({ articlesCount, pageSize }) => ({
    totalPages: computed(() => Math.ceil(articlesCount() / pageSize())),
  })),
  withComputed(({ selectedPage, totalPages }) => ({
    pagination: computed(() => ({ selectedPage, totalPages })),
  })),
  withMethods((store) => ({
    setPaginationSettings(s: RouteParamsPaginatonState): void {
      patchState(store, () => ({
        selectedPage: s.selectedPage === undefined ? initialArticleListState.selectedPage : Number(s.selectedPage) - 1,
        pageSize: s.pageSize === undefined ? initialArticleListState.pageSize : Number(s.pageSize),
      }));
    },
    setRequestStateLoading(): void {
      patchState(store, () => ({ httpRequestState: 'FETCHING' as const }));
    },
    setRequestStateSuccess(params: ArticlesResponseType): void {
      patchState(store, () => ({
        httpRequestState: 'FETCHED' as const,
        ...params
      }));
    },
    setRequestStateError(error: string): void {
      patchState(store, () => ({ httpRequestState: { errorMessage: error } }));
    },
    setSelectedPage(selectedPage: number): void {
      patchState(store, () => ({ selectedPage }));
    },
  })),
  withMethods((store, articlesService = inject(ArticlesService)) => ({
    loadArticles: rxMethod<void>(
      pipe(
        tap(() => store.setRequestStateLoading()),
        switchMap(() => articlesService.getArticles({
          limit: store.pageSize(),
          offset: store.selectedPage() * store.pageSize()
        })),
        tapResponse(
          (response) => {
            store.setRequestStateSuccess(response);
          },
          (errorResponse: HttpErrorResponse) => {
            store.setRequestStateError('Request error');
          }
        )
      )
    )
  })),
);

// withEffects(
//   ( {
//     selectedPage, pageSize,
//     setRequestStateLoading, setRequestStateSuccess, setRequestStateError
//     },
//   ) => {
//     const articlesService = inject(ArticlesService)
//     return {
//       async loadArticles() {
//         setRequestStateLoading();
//         try {
//           const response = await lastValueFrom(articlesService.getArticles({
//             limit: pageSize(),
//             offset: selectedPage() * pageSize()
//           }));
//           setRequestStateSuccess(response);
//         }
//         catch(e) {
//           setRequestStateError('Request error');
//         }
//       },
// loadArticles: rxEffect<void>(
//   pipe(
//     tap(() => setRequestStateLoading()),
//     switchMap(() => articlesService.getArticles({
//       limit: pageSize(),
//       offset: selectedPage() * pageSize()
//     })),
//     tapResponse(
//       (response) => {
//         setRequestStateSuccess(response);
//       },
//       (errorResponse: HttpErrorResponse) => {
//         setRequestStateError('Request error');
//       }
//     )
//   )
// )
