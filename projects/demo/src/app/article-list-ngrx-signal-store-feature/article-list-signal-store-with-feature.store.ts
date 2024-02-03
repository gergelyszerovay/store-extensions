import { patchState, signalStore, type, withComputed, withMethods, withState } from "@ngrx/signals";
import { withDataService } from "ngx-signal-store-data-service-feature";
import { computed, inject } from "@angular/core";
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { ArticlesService } from "../services/articles.service";
import { Article } from "../models/article.model";
import { map } from "rxjs/operators";

type ArticleListState = {
  readonly selectedPage: number,
  readonly pageSize: number,
  readonly articlesCount: number
}

export const initialArticleListState: ArticleListState = {
  selectedPage: 0,
  pageSize: 3,
  articlesCount: 0
}

export const ArticleListSignalStoreWithFeature = signalStore(
  withState(initialArticleListState),
  withEntities({ entity: type<Article>(), collection: 'article' }),
  withComputed(({ articlesCount, pageSize }) => ({
    totalPages: computed(() => Math.ceil(articlesCount() / pageSize())),
  })),
  withComputed(({ selectedPage, totalPages }) => ({
    pagination: computed(() => ({ selectedPage: selectedPage(), totalPages: totalPages() })),
  })),
  withMethods((store) => ({
    setSelectedPage(selectedPage: string | number | undefined): void {
      patchState(store, () => ({
        selectedPage: selectedPage === undefined ? initialArticleListState.selectedPage : Number(selectedPage),
      }));
    },
    setPageSize(pageSize: string | number | undefined): void {
      patchState(store, () => ({
        pageSize: pageSize === undefined ? initialArticleListState.pageSize : Number(pageSize)
      }));
    },
  })),
  withDataService({
    actionName: 'loadArticles',
    service$: (store /*, rxParams: void*/) => {
      const articlesService = inject(ArticlesService);
      return articlesService.getArticles({
        limit: store.pageSize(),
        offset: store.selectedPage() * store.pageSize()
      })
      .pipe(map(response => {
        return [
          // setAllEntities doesn't work with readonly arrays, ReadonlyArray<Article> => Array<Article>
          setAllEntities(response.articles as Array<Article>, { collection: 'article' }),
          {
            articlesCount: response.articlesCount
          }
      ] }))
    }
  })
);
