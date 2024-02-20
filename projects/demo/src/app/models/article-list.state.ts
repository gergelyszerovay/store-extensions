import {
  HttpRequestState,
  HttpRequestStates,
} from '../services/articles.service';
import { Articles } from './article.model';

export type RouteParamsPaginatonState = {
  readonly selectedPage?: string;
  readonly pageSize?: string;
};

export type ArticleListState = {
  readonly selectedPage: number;
  readonly pageSize: number;

  readonly httpRequestState: HttpRequestState;

  readonly articles: Articles;
  readonly articlesCount: number;
};

export const initialArticleListState: ArticleListState = {
  selectedPage: 0,
  pageSize: 3,

  httpRequestState: HttpRequestStates.INITIAL,

  articles: [],
  articlesCount: 0,
};
