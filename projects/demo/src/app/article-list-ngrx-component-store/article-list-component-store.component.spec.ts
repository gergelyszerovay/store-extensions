import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticlesService } from '../services/articles.service';
import { MockProvider } from 'ng-mocks';
import { provideRouter } from '@angular/router';
import { ArticleListComponent_CS } from './article-list-component-store.component';
import { ArticleListComponentStore } from './article-list-component-store.store';

describe('ArticleListComponent_CS', () => {
  let component: ArticleListComponent_CS;
  let fixture: ComponentFixture<ArticleListComponent_CS>;
  let store: ArticleListComponentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleListComponent_CS],
      providers: [
        MockProvider(ArticlesService),
        provideRouter([]),
        // provideMockSignalStore(ArticleListSignalStore, {
        //   initialState: {
        //     selectedPage: 1
        //   },
        //   computedInitialValues: {
        //     totalPages: 10
        //   }
        // })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_CS);
    component = fixture.componentInstance;
    store = TestBed.inject(ArticleListComponentStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    console.log(store)

  });

});
