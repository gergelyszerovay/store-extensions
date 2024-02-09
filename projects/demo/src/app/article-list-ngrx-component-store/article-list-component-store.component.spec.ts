import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticlesService } from '../services/articles.service';
import { MockProvider } from 'ng-mocks';
import { provideRouter } from '@angular/router';
import { ArticleListComponent_CS } from './article-list-component-store.component';
import { ArticleListComponentStore } from './article-list-component-store.store';
import { provideMockComponentStore } from '@gergelyszerovay/mock-component-store';

describe('ArticleListComponent_CS', () => {
  let component: ArticleListComponent_CS;
  let fixture: ComponentFixture<ArticleListComponent_CS>;
  let store: ArticleListComponentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleListComponent_CS],
      providers: [
        // MockProvider(ArticlesService),
        provideRouter([]),
        // provideMockComponentStore(ArticleListComponentStore)
        // provideMockSignalStore(ArticleListSignalStore, {
        //   initialState: {
        //     selectedPage: 1
        //   },
        //   computedInitialValues: {
        //     totalPages: 10
        //   }
        // })
      ],
    })
      .overrideComponent(ArticleListComponent_CS, {
        set: {
          providers: [
            MockProvider(ArticlesService), // injected in ArticleListComponentStore
            provideMockComponentStore(ArticleListComponentStore),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent_CS);
    component = fixture.componentInstance;
    // access to a service provided on the component level
    store = fixture.debugElement.injector.get(ArticleListComponentStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
