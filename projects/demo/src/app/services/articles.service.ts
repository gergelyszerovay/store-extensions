import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { Observable, delay, of, take, throwError } from "rxjs";
import { Article, Articles } from "../models/article.model";
import { httpResponse200 } from "./mock-data";
import { Writable } from "ts-essentials";

export enum HttpRequestStates {
  EMPTY = 'EMPTY',
  FETCHING = 'FETCHING',
  FETCHED ='FETCHED'
}

export type HttpRequestState =
  HttpRequestStates |
  { readonly errorMessage: string };

export function getHttpRequestStateError(httpRequestState: HttpRequestState): string | undefined {
  return (typeof(httpRequestState) === 'object' && httpRequestState?.errorMessage) || undefined;
}

@Pipe({ name: 'httpRequestStateErrorPipe', pure: true, standalone: true })
export class HttpRequestStateErrorPipe implements PipeTransform {
  transform(httpRequestState: HttpRequestState | undefined | null): string | undefined {
    return httpRequestState ? (getHttpRequestStateError(httpRequestState) || undefined) : undefined;
  }
}

export type ArticlesResponseType = {
  readonly articles: Articles,
  readonly articlesCount: number
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  constructor(
    private http: HttpClient
  ) { }

  getArticles(params: { offset: number, limit: number }): Observable<ArticlesResponseType> {
    // real API request
    // return this.http.get<ArticlesResponseType>(`${url}/articles?offset=${params.offset}&limit=${params.limit}`);

    // mock API request
    return of({
      ...httpResponse200,
      articles: httpResponse200.articles.slice(params.offset, params.offset + params.limit)
    } as ArticlesResponseType).pipe(
      take(1),
      delay(1000)
    );

    // mock API request with error response
    // return throwError(() => new HttpErrorResponse({ error: 500 }));
  }

  toggleFavorite(id: number): Observable<Article> {
    const article = httpResponse200.articles.find(a => a.id === id)! as Writable<Article>;
    if (article.favorited) {
      article.favorited = false;
      article.favoritesCount --;
    }
    else {
      article.favorited = true;
      article.favoritesCount ++;
    }
    return of({ ...article }).pipe(
      take(1),
      delay(1000)
    );
  }
}
