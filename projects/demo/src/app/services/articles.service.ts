import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { Observable, delay, of, take, throwError } from "rxjs";
import { Articles } from "../models/article.model";
import { DeepReadonly } from "ts-essentials";
import { httpResponse200 } from "./mock-data";

export type HttpRequestState = DeepReadonly<
  'EMPTY' | 'FETCHING' | 'FETCHED' |
  { errorMessage: string }
  >;

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
  articles: Articles,
  articlesCount: number
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  readonly rootUrl = 'https://api.realworld.io/api';

  constructor(
    private http: HttpClient
  ) { }

  getArticles(params: { offset: number, limit: number }): Observable<ArticlesResponseType> {
    // real API request
    // return this.http.get<ArticlesResponseType>(`${this.rootUrl}/articles?offset=${params.offset}&limit=${params.limit}`);

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
}
