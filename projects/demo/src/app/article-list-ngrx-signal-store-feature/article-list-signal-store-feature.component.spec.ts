import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockSignalStore, UnwrapProvider, asMockSignalStore, asSinonSpy, getRxMethodFake, provideMockSignalStore } from 'ngx-mock-signal-store';
import { ArticlesService, HttpRequestStates } from '../services/articles.service';
import { MockComponent, MockProvider } from 'ng-mocks';
import { patchState } from '@ngrx/signals';
import { screen } from '@testing-library/angular';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { Article, Articles } from '../models/article.model';
import { By } from '@angular/platform-browser';
import { ArticleListComponent_SSF } from './article-list-signal-store-feature.component';
import { ArticleListSignalStoreWithFeature } from './article-list-signal-store-with-feature.store';
import { EntityMap } from '@ngrx/signals/entities';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';

/*
Main UI states: fetching, fetched, error
Pagination: Inputs / outputs
Component input triggered effect
*/

describe('ArticleListComponent_SSF - mockComputedSignals: true', () => {
  let component: ArticleListComponent_SSF;
  let fixture: ComponentFixture<ArticleListComponent_SSF>;
  let store: UnwrapProvider<typeof ArticleListSignalStoreWithFeature>;
  let mockStore: MockSignalStore<typeof store>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleListComponent_SSF,
        MockComponent(UiArticleListComponent),
        MockComponent(UiPaginationComponent)
      ],
      providers: [
      ]
    })
    .overrideComponent(
      ArticleListComponent_SSF,
      {
        set: {
          providers: [
            MockProvider(ArticlesService), // injected in ArticleListSignalStore
            provideMockSignalStore(ArticleListSignalStoreWithFeature, {
              initialComputedValues: {
                totalPages: 0,
                pagination: { selectedPage: 0, totalPages: 0 },
                articleEntities: [],
                isLoadArticlesEmpty: false,
                isLoadArticlesFetching: false,
                isLoadArticlesFetched: false,
                getLoadArticlesError: undefined
              }
            })
          ]
        }
      }
    )
    .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_SSF);
    component = fixture.componentInstance;
    // access to a service provided on the component level
    store = fixture.debugElement.injector.get(ArticleListSignalStoreWithFeature);
    mockStore = asMockSignalStore(store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Main UI states', () => {
    it('should render the loading message if the request state is FETCHING', () => {
      mockStore.isLoadArticlesFetching.set(true);
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the loading message if the request state is EMPTY', () => {
      mockStore.isLoadArticlesEmpty.set(true);
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the error message if the request state is error', () => {
      mockStore.getLoadArticlesError.set({ errorMessage: 'error1' });
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeDefined();
    });

    describe('request state is FETCHED', () => {
      beforeEach(() => {
        mockStore.isLoadArticlesFetched.set(true);
        mockStore.articleEntities.set([
          { slug: 'slug 1', id: 1 } as Article
        ]);
        mockStore.pagination.set({ totalPages: 4, selectedPage: 1 });
        fixture.detectChanges();
      });

      it('should render the articles', () => {
        const uiArticleListComponent = fixture.debugElement.queryAll(By.directive(UiArticleListComponent))[0]?.componentInstance as UiArticleListComponent;
        expect(uiArticleListComponent).toBeDefined();
        expect(uiArticleListComponent.articles).toEqual([ { slug: 'slug 1', id: 1 } as Article ] as Articles)
        expect(screen.queryByText(/loading/i)).toBeNull();
        expect(screen.queryByText(/error1/i)).toBeNull();
      });

      it('should render the pagination component', () => {
        const uiPaginationComponent = fixture.debugElement.queryAll(By.directive(UiPaginationComponent))[0]?.componentInstance as UiPaginationComponent;
        expect(uiPaginationComponent).toBeDefined();
        expect(uiPaginationComponent.totalPages).toEqual(4);
        expect(uiPaginationComponent.selectedPage).toEqual(1)
      });
    });
  });

  describe('router inputs => store (effect)', () => {
    it('should update the store\'s state initially', () => {
      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
    });

    it('should call loadArticles if the selectedPage router input changes', () => {
      getRxMethodFake(mockStore.loadArticles).resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.detectChanges();
      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
    });

    it('should call loadArticles if the pageSize router input changes', () => {
      getRxMethodFake(mockStore.loadArticles).resetHistory();
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
    });

    it('should call loadArticles only once, even if the both the selectedPage ans pageSize router inputs change', () => {
      getRxMethodFake(mockStore.loadArticles).resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
    });
  });


  describe('User input (click on the pagination component) => store', () => {
    it('1', () => {
      mockStore.isLoadArticlesFetched.set(true);
      mockStore.articleEntities.set([
        { slug: 'slug 1', id: 1 } as Article
      ]);
      fixture.detectChanges();
      const uiArticleListComponent = fixture.debugElement.queryAll(By.directive(UiArticleListComponent))[0]?.componentInstance as UiArticleListComponent;
      expect(uiArticleListComponent).toBeDefined();
      expect(uiArticleListComponent.articles).toEqual([ { slug: 'slug 1', id: 1 } as Article ] as Articles)
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeNull();

      const uiPaginationComponent = fixture.debugElement.queryAll(By.directive(UiPaginationComponent))[0]?.componentInstance as UiPaginationComponent;
      expect(uiPaginationComponent).toBeDefined();

      // expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
      // expect(asSinonSpy(mockStore.setSelectedPage).callCount).toBe(1);

      getRxMethodFake(mockStore.loadArticles).resetHistory();
      asSinonSpy(mockStore.setSelectedPage).resetHistory();

      uiPaginationComponent.onPageSelected.emit(2);

      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
      expect(asSinonSpy(mockStore.setSelectedPage).callCount).toBe(1);
      expect(asSinonSpy(mockStore.setSelectedPage).lastCall.args).toEqual([2]);
    });
  });
});

describe('ArticleListComponent_SSF - mockComputedSignals: false', () => {
  let component: ArticleListComponent_SSF;
  let fixture: ComponentFixture<ArticleListComponent_SSF>;
  let store: UnwrapProvider<typeof ArticleListSignalStoreWithFeature>;
  let mockStore: MockSignalStore<typeof store>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleListComponent_SSF,
        MockComponent(UiArticleListComponent)
      ],
      providers: [
      ]
    })
    .overrideComponent(
      ArticleListComponent_SSF,
      {
        set: {
          providers: [
            MockProvider(ArticlesService), // injected in ArticleListSignalStore
            provideMockSignalStore(ArticleListSignalStoreWithFeature, {
              mockComputedSignals: false
            })
          ]
        }
      }
    )
    .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_SSF);
    component = fixture.componentInstance;
    // access to a service provided on the component level
    store = fixture.debugElement.injector.get(ArticleListSignalStoreWithFeature);
    mockStore = asMockSignalStore(store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Main UI states', () => {
    it('should render the loading message if the request state is FETCHING', () => {
      patchState(store, { loadArticlesRequestState: HttpRequestStates.FETCHING });
      fixture.detectChanges();
      // console.log('!', getState(store), store.isLoadArticlesFetching(), fixture.debugElement.nativeElement.innerHTML)
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the loading message if the request state is EMPTY', () => {
      patchState(store, { loadArticlesRequestState: HttpRequestStates.EMPTY });
      fixture.detectChanges();
      // console.log('!', getState(store), store.isLoadArticlesFetching(), fixture.debugElement.nativeElement.innerHTML)
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the error message if the request state is error', () => {
      patchState(store, { loadArticlesRequestState: { errorMessage: 'error1' } });
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeDefined();
    });

    it('should render the articles if the request state is FETCHED', () => {
      patchState(store, () => ({
        loadArticlesRequestState: HttpRequestStates.FETCHED,
        articleIds: [1],
        articleEntityMap: {
          1: { slug: 'slug 1', id: 1 } as Article
        } as EntityMap<Article>
      }));
      fixture.detectChanges();
      const uiArticleListComponent = fixture.debugElement.queryAll(By.directive(UiArticleListComponent))[0]?.componentInstance as UiArticleListComponent;
      expect(uiArticleListComponent).toBeDefined();
      expect(uiArticleListComponent.articles).toEqual([ { slug: 'slug 1', id: 1 } as Article ] as Articles)
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });
  });
});
