import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent_SS } from './article-list-signal-store.component';
import { ArticleListSignalStore } from './article-list-signal-store.store';
import { FAKE, UnwrapSignalStoreProvider, asMockSignalStore, provideMockSignalStore } from 'ngx-mock-signal-store';
import { ArticlesService } from '../services/articles.service';
import { MockProvider } from 'ng-mocks';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { Subject } from 'rxjs';

describe('ArticleListComponent_SS', () => {
  let component: ArticleListComponent_SS;
  let fixture: ComponentFixture<ArticleListComponent_SS>;
  let store: UnwrapSignalStoreProvider<typeof ArticleListSignalStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleListComponent_SS],
      providers: [
        MockProvider(ArticlesService),
        provideRouter([]),
        provideMockSignalStore(ArticleListSignalStore, {
          initialState: {
            selectedPage: 1
          },
          computedInitialValues: {
            totalPages: 10
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_SS);
    component = fixture.componentInstance;
    store = TestBed.inject(ArticleListSignalStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const m = asMockSignalStore(store);

    expect(m.selectedPage()).toBe(1);
    expect(m.totalPages()).toBe(10);

    m.totalPages.set(2);
    expect(m.totalPages()).toBe(2);

    patchState(store, () => ({ selectedPage: 2 }));
    expect(m.selectedPage()).toBe(2);

    expect(m.setRequestStateLoading.callCount).toBe(0);
    store.setRequestStateLoading();
    expect(m.setRequestStateLoading.callCount).toBe(1);

    expect(m.setRequestStateError.callCount).toBe(0);
    store.setRequestStateError('message');
    expect(m.setRequestStateError.callCount).toBe(1);
    expect(m.setRequestStateError.lastCall.args).toEqual(['message']);

    const o = new Subject<void>();

    store.loadArticles(o);

    expect(m.loadArticles[FAKE].callCount).toBe(0);
    o.next()
    expect(m.loadArticles[FAKE].callCount).toBe(1);
    expect(m.loadArticles[FAKE].lastCall.args).toEqual([undefined]); // ?!
    store.loadArticles();
    expect(m.loadArticles[FAKE].callCount).toBe(2);
    expect(m.loadArticles[FAKE].lastCall.args).toEqual([undefined]); // ?!
  });

});
