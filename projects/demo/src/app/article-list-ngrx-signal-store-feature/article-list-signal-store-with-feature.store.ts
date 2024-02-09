import {patchState, signalStore, type, withComputed, withMethods, withState} from '@ngrx/signals';
import {withDataService} from '@gergelyszerovay/signal-store-data-service-feature';
import {computed, inject} from '@angular/core';
import {setAllEntities, setEntity, withEntities} from '@ngrx/signals/entities';
import {ArticlesService} from '../services/articles.service';
import {Article} from '../models/article.model';
import {map, switchMap, tap} from 'rxjs/operators';
import {pipe} from 'rxjs';
import {rxMethod} from '@ngrx/signals/rxjs-interop';

type ArticleListState = {
  readonly selectedPage: number;
  readonly pageSize: number;
  readonly articlesCount: number;
};

export const initialArticleListState: ArticleListState = {
  selectedPage: 0,
  pageSize: 3,
  articlesCount: 0,
};

export const ArticleListSignalStoreWithFeature = signalStore(
  withState(initialArticleListState),
  withEntities({entity: type<Article>(), collection: 'article'}),
  withComputed(({articlesCount, pageSize}) => ({
    totalPages: computed(() => Math.ceil(articlesCount() / pageSize())),
  })),
  withComputed(({selectedPage, totalPages}) => ({
    pagination: computed(() => ({selectedPage: selectedPage(), totalPages: totalPages()})),
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
  })),
  withDataService({
    actionName: 'loadArticles',
    service: (store /*, rxParams: void*/) => {
      // inject the service
      const articlesService = inject(ArticlesService);
      // get the observable for sending the request to the server
      return articlesService
        .getArticles({
          limit: store.pageSize(),
          offset: store.selectedPage() * store.pageSize(),
        })
        .pipe(
          map((response) => {
            return [
              // setAllEntities doesn't work with readonly arrays, ReadonlyArray<Article> => Array<Article>
              setAllEntities(response.articles as Array<Article>, {collection: 'article'}),
              {
                articlesCount: response.articlesCount,
              },
            ];
          }),
        );
    },
  }),
  withDataService({
    actionName: 'toggleFavorite',
    service: (store, articleId: number) => {
      // inject the service
      const articlesService = inject(ArticlesService);
      // optimistic update
      const article = store.articleEntityMap()[articleId]!;
      console.log('optimistic update', article);
      if (article.favorited) {
        patchState(
          store,
          setEntity(
            {...article, favorited: false, favoritesCount: article.favoritesCount - 1},
            {collection: 'article'},
          ),
        );
      } else {
        patchState(
          store,
          setEntity(
            {...article, favorited: true, favoritesCount: article.favoritesCount + 1},
            {collection: 'article'},
          ),
        );
      }
      // get the observable for sending the request to the server
      return articlesService.toggleFavorite(articleId).pipe(
        // transform the response to the store's data format
        map((response) => {
          return [setEntity(response, {collection: 'article'})];
        }),
      );
    },
  }),
);
