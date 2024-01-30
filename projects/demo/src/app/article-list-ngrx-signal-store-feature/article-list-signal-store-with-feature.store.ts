import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { withDataService } from "./with-data-service.feature";
import { computed, inject } from "@angular/core";
import { ArticlesService } from "../services/articles.service";

export const initialArticleListState = {
  selectedPage: 0,
  pageSize: 3,

  articles: [],
  articlesCount: 0
}

export const ArticleListSignalStoreWithFeature = signalStore(
  withState(initialArticleListState),
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
        pageSize: pageSize === undefined ? initialArticleListState.pageSize : Number(pageSize),
      }));
    },
  })),
  withDataService({
    prefix: 'loadArticles',
    service$: (params: { offset: number, limit: number }) => {
      const articlesService = inject(ArticlesService);
      return articlesService.getArticles(params)
    },
    transformResponseFn: (x) => x
  })
);
