# `withDataService` Custom Store Feature

The `withDataService` feature connects a data service to the store and tracks the state of the HTTP request.

To start the demo app, clone this repo, run `pnpm install` and `pnpm run start`, then open http://localhost:4200/article-list-signal-store-with-feature in your browser.

Here is the source of the demo app's SignalStore: https://github.com/gergelyszerovay/store-extensions/tree/main/projects/demo/src/app/article-list-ngrx-signal-store-feature

## HTTP Request state

The `withDataService` feature represents the request state with the `HttpRequestState` data type:

```ts
export type HttpRequestState = HttpRequestStates | HttpRequestError;
```

The `HttpRequestState` can be one of these request states:

```ts
export enum HttpRequestStates {
  // no request has been made
  INITIAL = 'INITIAL', 
  // a request is started, and we're waiting for the server's response
  FETCHING = 'FETCHING', 
  // a request has been successfully fetched
  FETCHED ='FETCHED' 
}
```

or a `HttpRequestError` object, if the request fails:

```ts
export type HttpRequestError = {
  readonly errorMessage: string,
  readonly errorCode?: number
  readonly errorData?: unknown;
}
```

The `withDataService` feature has three config options: `actionName`, `service` and the optional `extractHttpErrorMessageFn`.

### actionName

We use this string to customize the name of the generated signals and methods. If the `actionName` is `loadArticles`, `withDataService` adds the `loadArticles()` RxMethod to the store. In the demo app this RxMethod triggers the loading of the article list. It also adds the `loadArticlesRequestState: HttpRequestState` signal, and the following computed signals:

- `isArticleListInitial()`: true, if the there was no request yet (initial state)
- `isArticleListFetching()`: true, when the service sent the request to the server, but there is no response yet
- `isArticleListFetched()`: true, when the service sent the request to the server, and we got a valid response
- `getArticleListError()`: undefined, when the service sent the request to the server, and we got a valid response. It's a `HttpRequestError`, if there was an error during the request

### service

This option passes a callback function to `withDataService`. The callback function returns an observable that, when subscribed, executes a request on the server. The function has two parameters:

- `store`: it contains the SignalStore itself, and
- `rxParams`: the parameter we passed to the RxMethod (`loadArticles()` or `toggleFavorite()`). In the `loadArticles()` method we don't use this parameter. We pass the article id to the `toggleFavorite()` method.

This is an example of the callback function:

```ts
  withDataService({
    actionName: 'loadArticles',
    service: (store /*, rxParams: void*/) => {
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
        ] })
      );
    }
  })
```

It injects the service, creates the observable, and maps the response to a list of partial states (`articlesCount: response.articlesCount`) or partial state updaters (`setAllEntities()`). This data structure is similar to the parameters of `patchState`. 

The callback function can implement the optimistic update pattern. It immediately updates the state when called, and when a response is received from the server, it updates the state a second time:

```ts
  withDataService({
    actionName: 'toggleFavorite',
    service: (store, articleId: number) => {
      // inject the service
      const articlesService = inject(ArticlesService);
      // optimistic update
      const article = store.articleEntityMap()[articleId]!;
      console.log('optimistic update', article);
      if (article.favorited) {
        patchState(store, setEntity(
          { ...article, favorited: false, favoritesCount: article.favoritesCount - 1 },
          { collection: 'article' })
        );
      }
      else {
        patchState(store, setEntity(
          { ...article, favorited: true, favoritesCount: article.favoritesCount + 1 },
          { collection: 'article' })
        );
      }
      // get the observable for sending the request to the server
      return articlesService.toggleFavorite(articleId).pipe(
      // transform the response to the store's data format
      map(response => {
        return [
          setEntity(response, { collection: 'article' })
      ] }));
    }
  })
```

### extractHttpErrorMessageFn

This option is optional. We can specify a function that maps Angular's `HttpErrorResponse` to a `HttpRequestError`. If this function is not specified, `withDataService` uses a simple, built-in version. Alternatively, you can specify a customized one that properly handles your specific backend's error responses.
