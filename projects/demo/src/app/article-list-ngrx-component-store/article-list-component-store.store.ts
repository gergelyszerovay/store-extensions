import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { Observable, switchMap, tap, withLatestFrom } from "rxjs";
import { DeepReadonly } from "ts-essentials";
import { Articles } from "../models/article.model";
import { ArticleListState, initialArticleListState, RouteParamsPaginatonState } from "../models/article-list.state";
import { ArticlesResponseType, ArticlesService, HttpRequestState } from "../services/articles.service";

@Injectable()
export class ArticleListComponentStore extends ComponentStore<ArticleListState> {
  readonly selectedPage$: Observable<number> = this.select(state => state.selectedPage);
  readonly pageSize$: Observable<number> = this.select(state => state.pageSize);
  readonly httpRequestState$: Observable<HttpRequestState> = this.select(state => state.httpRequestState);
  readonly articles$: Observable<DeepReadonly<Articles>> = this.select(state => state.articles);
  readonly articlesCount$: Observable<number> = this.select(state => state.articlesCount);

  readonly totalPages$: Observable<number> = this.select(
    this.articlesCount$, this.pageSize$,
    (articlesCount, pageSize) => Math.ceil(articlesCount / pageSize));

  readonly pagination$: Observable<{ selectedPage: number, totalPages: number }> = this.select(
    this.selectedPage$,
    this.totalPages$,
    (selectedPage, totalPages) => ({ selectedPage, totalPages })
  );

  readonly articlesService = inject(ArticlesService);

  constructor(
  ) {
    super(initialArticleListState);
  }

  setPaginationSettings = this.updater((state, s: RouteParamsPaginatonState): ArticleListState => {
    return {
      ...state,
      selectedPage: s.selectedPage === undefined ? initialArticleListState.selectedPage : Number(s.selectedPage) - 1,
      pageSize: s.pageSize === undefined ? initialArticleListState.pageSize : Number(s.pageSize),
    };
  });

  readonly loadArticles = this.effect<void>((trigger$: Observable<void>) => {
    return trigger$.pipe(
      withLatestFrom(this.selectedPage$, this.pageSize$),
      tap(() => this.setRequestStateLoading()),
      switchMap(([, selectedPage, pageSize]) => {
        return this.articlesService.getArticles({
          limit: pageSize,
          offset: selectedPage * pageSize
        }).pipe(
          tapResponse(
            (response) => {
              this.setRequestStateSuccess(response);
            },
            (errorResponse: HttpErrorResponse) => {
              this.setRequestStateError('Request error');
            }
          ),
        );
      }),
    );
  });

  setRequestStateLoading = this.updater((state): ArticleListState => {
    return {
      ...state,
      httpRequestState: 'FETCHING'
    }
  });

  setRequestStateSuccess = this.updater((state, params: ArticlesResponseType): ArticleListState => {
    return {
      ...state,
      httpRequestState: 'FETCHED',
      ...params
    }
  });

  setRequestStateError = this.updater((state, error: string): ArticleListState => {
    return {
      ...state,
      httpRequestState: { errorMessage: error }
    }
  });

  setSelectedPage = this.updater((state, selectedPage: number): ArticleListState => {
    return {
      ...state,
      selectedPage
    }
  });
}
