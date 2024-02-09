import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockSignalStore,
  UnwrapProvider,
  asMockSignalStore,
  asSinonSpy,
  provideMockSignalStore,
} from '@gergelyszerovay/mock-signal-store';
import { ArticlesService } from '../services/articles.service';
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
import { getRxMethodFake } from '@gergelyszerovay/fake-rx-method';
import { HttpRequestStates } from '@gergelyszerovay/signal-store-data-service-feature';

describe('ArticleListComponent_SSF - mockComputedSignals: true + mock all child components', () => {
  let component: ArticleListComponent_SSF;
  let fixture: ComponentFixture<ArticleListComponent_SSF>;
  let store: UnwrapProvider<typeof ArticleListSignalStoreWithFeature>;
  let mockStore: MockSignalStore<typeof store>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleListComponent_SSF,
        MockComponent(UiArticleListComponent),
        MockComponent(UiPaginationComponent),
      ],
      providers: [],
    })
      .overrideComponent(ArticleListComponent_SSF, {
        set: {
          providers: [
            MockProvider(ArticlesService), // injected in ArticleListSignalStore
            provideMockSignalStore(ArticleListSignalStoreWithFeature, {
              initialComputedValues: {
                totalPages: 0,
                pagination: { selectedPage: 0, totalPages: 0 },
                articleEntities: [],
                isLoadArticlesInitial: false,
                isLoadArticlesFetching: false,
                isLoadArticlesFetched: false,
                getLoadArticlesError: undefined,
                isToggleFavoriteInitial: false,
                isToggleFavoriteFetching: false,
                isToggleFavoriteFetched: false,
                getToggleFavoriteError: undefined,
              },
            }),
          ],
        },
      })
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

  describe('router inputs ➡️ store (effect)', () => {
    it("should update the store's state initially", () => {
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

    it('should call loadArticles only once, even if the both the selectedPage and pageSize router inputs change', () => {
      getRxMethodFake(mockStore.loadArticles).resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
    });
  });

  describe('Main UI states', () => {
    it('should render the loading message if the request state is FETCHING', () => {
      mockStore.isLoadArticlesFetching.set(true);
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the loading message if the request state is INITIAL', () => {
      mockStore.isLoadArticlesInitial.set(true);
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
  });

  describe('Main UI state: FETCHED', () => {
    let uiPaginationComponent: UiPaginationComponent;
    let uiArticleListComponent: UiArticleListComponent;
    beforeEach(() => {
      mockStore.isLoadArticlesFetched.set(true);
      mockStore.articleEntities.set([{ slug: 'slug 1', id: 1 } as Article]);
      mockStore.pagination.set({ totalPages: 4, selectedPage: 1 });
      fixture.detectChanges();

      uiArticleListComponent = fixture.debugElement.queryAll(
        By.directive(UiArticleListComponent),
      )[0]?.componentInstance as UiArticleListComponent;

      uiPaginationComponent = fixture.debugElement.queryAll(By.directive(UiPaginationComponent))[0]
        ?.componentInstance as UiPaginationComponent;
    });

    describe('Child component: article list', () => {
      it('should render the articles', () => {
        const uiArticleListComponent = fixture.debugElement.queryAll(
          By.directive(UiArticleListComponent),
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

      describe('When the user favorites an article', () => {
        beforeEach(() => {
          getRxMethodFake(mockStore.toggleFavorite).resetHistory();
          uiArticleListComponent.toggleFavorite.emit(75);
        });
        it("should call the store's updater", () => {
          expect(getRxMethodFake(mockStore.toggleFavorite).callCount).toBe(1);
        });
      });
    });

    describe('Child component: pagination', () => {
      it('should render the pagination component', () => {
        const uiPaginationComponent = fixture.debugElement.queryAll(
          By.directive(UiPaginationComponent),
        )[0]?.componentInstance as UiPaginationComponent;
        expect(uiPaginationComponent).toBeDefined();
        expect(uiPaginationComponent.totalPages).toEqual(4);
        expect(uiPaginationComponent.selectedPage).toEqual(1);
      });

      it('should get the selected page and the number of the total pages from the store', () => {
        mockStore.pagination.set({ selectedPage: 6, totalPages: 7 });
        fixture.detectChanges();
        expect(uiPaginationComponent.selectedPage).toBe(6);
        expect(uiPaginationComponent.totalPages).toBe(7);
      });

      describe('When the user selects a page', () => {
        beforeEach(() => {
          getRxMethodFake(mockStore.loadArticles).resetHistory();
          asSinonSpy(mockStore.setSelectedPage).resetHistory();

          uiPaginationComponent.onPageSelected.emit(2);
        });
        it('should update the selected page in the store', () => {
          expect(asSinonSpy(mockStore.setSelectedPage).callCount).toBe(1);
          expect(asSinonSpy(mockStore.setSelectedPage).lastCall.args).toEqual([2]);
        });

        it('should fetch the articles from the server', () => {
          expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
        });
      });
    });
  });
});
