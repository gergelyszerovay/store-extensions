import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { ArticleListState, initialArticleListState } from '../models/article-list.state';
import {
  ArticlesService,
  ArticlesResponseType,
  HttpRequestStates,
} from '../services/articles.service';
import { tapResponse } from '@ngrx/component-store';
import { HttpErrorResponse } from '@angular/common/http';

export const ArticleListSignalStore = signalStore(
  withState<ArticleListState>(initialArticleListState),
  withComputed(({ articlesCount, pageSize }) => ({
    totalPages: computed(() => Math.ceil(articlesCount() / pageSize())),
  })),
  withComputed(({ selectedPage, totalPages }) => ({
    pagination: computed(() => ({ selectedPage: selectedPage(), totalPages: totalPages() })),
  })),
  withMethods((store) => ({
    setSelectedPage(selectedPage: string | number | undefined): void {
      patchState(store, () => ({
        selectedPage:
          selectedPage === undefined ? initialArticleListState.selectedPage : Number(selectedPage),
      }));
    },
    setPageSize(pageSize: string | number | undefined): void {
      patchState(store, () => ({
        pageSize: pageSize === undefined ? initialArticleListState.pageSize : Number(pageSize),
      }));
    },
    setRequestStateLoading(): void {
      patchState(store, () => ({ httpRequestState: HttpRequestStates.FETCHING }));
    },
    setRequestStateSuccess(params: ArticlesResponseType): void {
      patchState(store, () => ({
        httpRequestState: HttpRequestStates.FETCHED,
        ...params,
      }));
    },
    setRequestStateError(error: string): void {
      patchState(store, () => ({ httpRequestState: { errorMessage: error } }));
    },
  })),
  withMethods((store, articlesService = inject(ArticlesService)) => ({
    loadArticles: rxMethod<void>(
      pipe(
        tap(() => store.setRequestStateLoading()),
        switchMap(() =>
          articlesService.getArticles({
            limit: store.pageSize(),
            offset: store.selectedPage() * store.pageSize(),
          }),
        ),
        tapResponse(
          (response) => {
            store.setRequestStateSuccess(response);
          },
          (errorResponse: HttpErrorResponse) => {
            store.setRequestStateError('Request error');
          },
        ),
      ),
    ),
  })),
);
