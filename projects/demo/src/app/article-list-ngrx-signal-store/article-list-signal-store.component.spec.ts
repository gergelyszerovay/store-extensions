import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent_SS } from './article-list-signal-store.component';
import { ArticleListSignalStore } from './article-list-signal-store.store';
import { MockSignalStore, UnwrapProvider, asMockSignalStore, getRxMethodFake, provideMockSignalStore } from 'ngx-mock-signal-store';
import { ArticlesService, HttpRequestStates } from '../services/articles.service';
import { MockComponent, MockProvider } from 'ng-mocks';
import { patchState } from '@ngrx/signals';
import { screen } from '@testing-library/angular';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { Article, Articles } from '../models/article.model';
import { By } from '@angular/platform-browser';

/*
Main UI states: fetching, fetched, error
Pagination: Inputs / outputs
Component input triggered effect
*/

describe('ArticleListComponent_SS', () => {
  let component: ArticleListComponent_SS;
  let fixture: ComponentFixture<ArticleListComponent_SS>;
  let store: UnwrapProvider<typeof ArticleListSignalStore>;
  let mockStore: MockSignalStore<typeof store>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleListComponent_SS,
        MockComponent(UiArticleListComponent)
      ],
      providers: [
      ]
    })
    .overrideComponent(
      ArticleListComponent_SS,
      {
        set: {
          providers: [
            MockProvider(ArticlesService), // injected in ArticleListSignalStore
            provideMockSignalStore(ArticleListSignalStore, {
              initialComputedValues: {
                totalPages: 0,
                pagination: { selectedPage: 0, totalPages: 0 }
              }
            })
          ]
        }
      }
    )
    .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_SS);
    component = fixture.componentInstance;
    // access to a service provided on the component level
    store = fixture.debugElement.injector.get(ArticleListSignalStore);
    store = component.store;
    mockStore = asMockSignalStore(store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Main UI states', () => {
    it('should render the loading message if the request state is FETCHING', () => {
      patchState(store, () => ({ httpRequestState: HttpRequestStates.FETCHING }))
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeDefined();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });

    it('should render the error message if the request state is error', () => {
      patchState(store, () => ({ httpRequestState: { errorMessage: 'error1' } }))
      fixture.detectChanges();
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeDefined();
    });

    it('should render the articles if the request state is FETCHED', () => {
      patchState(store, () => ({
        httpRequestState: HttpRequestStates.FETCHED,
        articles: [
          { slug: 'slug 1', } as Article
        ]
      }))
      fixture.detectChanges();
      const uiArticleListComponent = fixture.debugElement.queryAll(By.directive(UiArticleListComponent))[0]?.componentInstance as UiArticleListComponent;
      expect(uiArticleListComponent).toBeDefined();
      expect(uiArticleListComponent.articles).toEqual([ { slug: 'slug 1' } as Article ] as Articles)
      expect(screen.queryByText(/loading/i)).toBeNull();
      expect(screen.queryByText(/error1/i)).toBeNull();
    });
  });

  describe('Effect: router inputs => store', () => {
    it('should update the store\'s state initially', () => {
      console.log(mockStore);
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
});
