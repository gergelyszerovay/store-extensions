import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent_SS } from './article-list-signal-store.component';
import { ArticleListSignalStore } from './article-list-signal-store.store';
import {
  UnwrapProvider,
  asSinonSpy,
  getRxMethodFake,
  newFakeRxMethod,
} from '@gergelyszerovay/mock-signal-store';
import {
  ArticlesService,
  HttpRequestState,
  HttpRequestStates,
} from '../services/articles.service';
import { MockComponent, MockProvider } from 'ng-mocks';
import { patchState } from '@ngrx/signals';
import { screen } from '@testing-library/angular';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { Article, Articles } from '../models/article.model';
import { By } from '@angular/platform-browser';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { WritableSignal, signal } from '@angular/core';
import sinon from 'sinon';

class MockArticleListSignalStore {
  // Signals are replaced by WritableSignals
  selectedPage = signal(0);
  pageSize = signal(3);
  httpRequestState = signal<HttpRequestState>(HttpRequestStates.INITIAL);
  articles = signal<Articles>([]);
  articlesCount = signal(0);

  // Computed Signals are replaced by WritableSignals
  totalPages = signal(0);
  pagination = signal({ selectedPage: 0, totalPages: 0 });

  // Functions are replaced by Sinon fakes
  setSelectedPage = sinon.fake();
  setPageSize = sinon.fake();
  setRequestStateLoading = sinon.fake();
  setRequestStateSuccess = sinon.fake();
  setRequestStateError = sinon.fake();

  // RxMethods are replaced by FakeRxMethods
  loadArticles = newFakeRxMethod();
}

describe('ArticleListComponent_SS - mockComputedSignals: true + mock all child components', () => {
  let component: ArticleListComponent_SS;
  let fixture: ComponentFixture<ArticleListComponent_SS>;
  // we have to use UnwrapProvider<T> to get the real type of a SignalStore
  let store: UnwrapProvider<typeof ArticleListSignalStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleListComponent_SS,
        MockComponent(UiArticleListComponent),
        MockComponent(UiPaginationComponent),
      ],
      providers: [],
    })
      .overrideComponent(ArticleListComponent_SS, {
        set: {
          providers: [
            // override the component level providers
            MockProvider(ArticlesService), // injected in ArticleListSignalStore
            {
              provide: ArticleListSignalStore,
              useClass: MockArticleListSignalStore,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_SS);
    component = fixture.componentInstance;
    // access to a service provided on the component level
    store = fixture.debugElement.injector.get(ArticleListSignalStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('router inputs ➡️ store (effect)', () => {
    it("should update the store's state initially", () => {
      expect(getRxMethodFake(store.loadArticles).callCount).toBe(1);
    });

    it('should call loadArticles if the selectedPage router input changes', () => {
      getRxMethodFake(store.loadArticles).resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.detectChanges();
      expect(getRxMethodFake(store.loadArticles).callCount).toBe(1);
    });

    it('should call loadArticles if the pageSize router input changes', () => {
      getRxMethodFake(store.loadArticles).resetHistory();
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(getRxMethodFake(store.loadArticles).callCount).toBe(1);
    });

    it('should call loadArticles only once, even if the both the selectedPage and pageSize router inputs change', () => {
      getRxMethodFake(store.loadArticles).resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(getRxMethodFake(store.loadArticles).callCount).toBe(1);
    });
  });

  describe('Main UI states', () => {
    it('should render the loading message if the request state is FETCHING', () => {
      (store.httpRequestState as WritableSignal<HttpRequestState>).set(
        HttpRequestStates.FETCHING
      );
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the loading message if the request state is INITIAL', () => {
      (store.httpRequestState as WritableSignal<HttpRequestState>).set(
        HttpRequestStates.INITIAL
      );
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the error message if the request state is error', () => {
      (store.httpRequestState as WritableSignal<HttpRequestState>).set({
        errorMessage: 'error1',
      });
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeDefined();
    });

    describe('Main UI state: FETCHED', () => {
      let uiPaginationComponent: UiPaginationComponent;
      let uiArticleListComponent: UiArticleListComponent;
      beforeEach(() => {
        (store.httpRequestState as WritableSignal<HttpRequestState>).set(
          HttpRequestStates.FETCHED
        );
        (store.articles as WritableSignal<Articles>).set([
          { slug: 'slug 1', id: 1 } as Article,
        ]);
        (
          store.pagination as WritableSignal<{
            totalPages: number;
            selectedPage: number;
          }>
        ).set({ totalPages: 4, selectedPage: 1 });
        fixture.detectChanges();

        uiArticleListComponent = fixture.debugElement.queryAll(
          By.directive(UiArticleListComponent)
        )[0]?.componentInstance as UiArticleListComponent;

        uiPaginationComponent = fixture.debugElement.queryAll(
          By.directive(UiPaginationComponent)
        )[0]?.componentInstance as UiPaginationComponent;
      });

      describe('Child component: article list', () => {
        it('should render the articles', () => {
          const uiArticleListComponent = fixture.debugElement.queryAll(
            By.directive(UiArticleListComponent)
          )[0]?.componentInstance as UiArticleListComponent;
          expect(uiArticleListComponent).toBeDefined();
          expect(uiArticleListComponent.articles).toEqual([
            { slug: 'slug 1', id: 1 } as Article,
          ] as Articles);
          expect(screen.queryByText(/loading/i)).toBeNull();
          expect(screen.queryByText(/error1/i)).toBeNull();
        });

        it('should get the article list from the store', () => {
          expect(uiArticleListComponent.articles).toEqual([
            { slug: 'slug 1', id: 1 } as Article,
          ] as Articles);
        });
      });

      describe('Child component: pagination', () => {
        it('should render the pagination component', () => {
          const uiPaginationComponent = fixture.debugElement.queryAll(
            By.directive(UiPaginationComponent)
          )[0]?.componentInstance as UiPaginationComponent;
          expect(uiPaginationComponent).toBeDefined();
          expect(uiPaginationComponent.totalPages).toEqual(4);
          expect(uiPaginationComponent.selectedPage).toEqual(1);
        });

        it('should get the selected page and the number of the total pages from the store', () => {
          (
            store.pagination as WritableSignal<{
              totalPages: number;
              selectedPage: number;
            }>
          ).set({ selectedPage: 6, totalPages: 7 });
          fixture.detectChanges();
          expect(uiPaginationComponent.selectedPage).toBe(6);
          expect(uiPaginationComponent.totalPages).toBe(7);
        });

        describe('When the user selects a page', () => {
          beforeEach(() => {
            getRxMethodFake(store.loadArticles).resetHistory();
            asSinonSpy(store.setSelectedPage).resetHistory();

            uiPaginationComponent.onPageSelected.emit(2);
          });
          it('should update the selected page in the store', () => {
            expect(asSinonSpy(store.setSelectedPage).callCount).toBe(1);
            expect(asSinonSpy(store.setSelectedPage).lastCall.args).toEqual([
              2,
            ]);
          });

          it('should fetch the articles from the server', () => {
            expect(getRxMethodFake(store.loadArticles).callCount).toBe(1);
          });
        });
      });
    });
  });
});
