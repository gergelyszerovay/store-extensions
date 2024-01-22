import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent_SS } from './article-list-signal-store.component';
import { ArticleListSignalStore } from './article-list-signal-store.store';
import { FAKE, MockSignalStore, UnwrapSignalStoreProvider, asMockSignalStore, provideMockSignalStore } from 'ngx-mock-signal-store';
import { ArticlesService } from '../services/articles.service';
import { MockComponent, MockProvider } from 'ng-mocks';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { Subject } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ApplicationRef, InputSignal, WritableSignal, signal, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
// @ts-ignore
import JasmineDOM from '@testing-library/jasmine-dom';
import { Article, Articles } from '../models/article.model';
import { By } from '@angular/platform-browser';

function CreateInputSignal<T>(v: T) {
  return signal(v).asReadonly() as InputSignal<T, T>;
}

fdescribe('ArticleListComponent_SS', () => {
  let component: ArticleListComponent_SS;
  let fixture: ComponentFixture<ArticleListComponent_SS>;
  let store: UnwrapSignalStoreProvider<typeof ArticleListSignalStore>;
  let mockStore: MockSignalStore<typeof store>;
  let appRef: ApplicationRef;

  // beforeAll(() => jasmine.addMatchers(JasmineDOM));

  // it('1', async () => {
  //   const user = userEvent.setup();

  //   await render(ArticleListComponent_SS, {
  //     providers: [
  //       // injected in ArticleListSignalStore
  //       MockProvider(ArticlesService),
  //       provideMockSignalStore(ArticleListSignalStore, {
  //         // initialStatePatch: {
  //         //   selectedPage: 1
  //         // },
  //         initialComputedValues: {
  //           totalPages: 0,
  //           pagination: { selectedPage: 0, totalPages: 0 }
  //         }
  //       })
  //     ],
  //     componentProperties: {
  //       selectedPage: CreateInputSignal('21' as string | undefined),
  //       pageSize: CreateInputSignal('22' as string | undefined)
  //     }
  //   });
  // });

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
            // injected in ArticleListSignalStore
            MockProvider(ArticlesService),
            // ArticleListSignalStore
            provideMockSignalStore(ArticleListSignalStore, {
              // initialStatePatch: {
              //   selectedPage: 1
              // },
              // mockComputedSignals: 'initialComputedValues',
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
    // TODO: not works
    // store = TestBed.inject(ArticleListSignalStore);
    store = component.store;
    mockStore = asMockSignalStore(store);
    appRef = TestBed.inject(ApplicationRef);
    fixture.detectChanges();
  });

  describe('Main UI states', () => {
    it('should render the loading message if the request state is FETCHING', () => {
      patchState(store, () => ({ httpRequestState: 'FETCHING' as const }))
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

    fit('should render the articles if the request state is FETCHED', () => {
      patchState(store, () => ({
        httpRequestState: 'FETCHED' as const,
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

  xdescribe('Effect: router inputs => store', () => {
    it('should update the store\'s state initially', () => {
      console.log(mockStore);
      expect(mockStore.loadArticles[FAKE].callCount).toBe(1);
    });

    it('should call loadArticles if the selectedPage router input changes', () => {
      mockStore.loadArticles[FAKE].resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.detectChanges();
      expect(mockStore.loadArticles[FAKE].callCount).toBe(1);
    });

    it('should call loadArticles if the pageSize router input changes', () => {
      mockStore.loadArticles[FAKE].resetHistory();
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(mockStore.loadArticles[FAKE].callCount).toBe(1);
    });

    it('should call loadArticles only once, even if the both the selectedPage ans pageSize router inputs change', () => {
      mockStore.loadArticles[FAKE].resetHistory();
      fixture.componentRef.setInput('selectedPage', '22');
      fixture.componentRef.setInput('pageSize', '11');
      fixture.detectChanges();
      expect(mockStore.loadArticles[FAKE].callCount).toBe(1);
    });

  });


  // it('should create', () => {
  //   expect(component).toBeTruthy();

  //   const m = asMockSignalStore(store);

  //   expect(m.selectedPage()).toBe(1);
  //   expect(m.totalPages()).toBe(10);

  //   m.totalPages.set(2);
  //   expect(m.totalPages()).toBe(2);

  //   patchState(store, () => ({ selectedPage: 2 }));
  //   expect(m.selectedPage()).toBe(2);

  //   expect(m.setRequestStateLoading.callCount).toBe(0);
  //   store.setRequestStateLoading();
  //   expect(m.setRequestStateLoading.callCount).toBe(1);

  //   expect(m.setRequestStateError.callCount).toBe(0);
  //   store.setRequestStateError('message');
  //   expect(m.setRequestStateError.callCount).toBe(1);
  //   expect(m.setRequestStateError.lastCall.args).toEqual(['message']);

  //   const o = new Subject<void>();

  //   store.loadArticles(o);

  //   expect(m.loadArticles[FAKE].callCount).toBe(0);
  //   o.next()
  //   expect(m.loadArticles[FAKE].callCount).toBe(1);
  //   expect(m.loadArticles[FAKE].lastCall.args).toEqual([undefined]); // ?!
  //   store.loadArticles();
  //   expect(m.loadArticles[FAKE].callCount).toBe(2);
  //   expect(m.loadArticles[FAKE].lastCall.args).toEqual([undefined]); // ?!
  // });

});
