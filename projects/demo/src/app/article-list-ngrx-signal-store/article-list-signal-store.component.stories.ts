import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { ArticleListComponent_SS } from './article-list-signal-store.component';
import {
  asMockSignalStore,
  asSinonSpy,
  getRxMethodFake,
  provideMockSignalStore,
} from '@gergelyszerovay/mock-signal-store';
import { ArticleListSignalStore } from './article-list-signal-store.store';
import {
  ArticlesService,
  HttpRequestStateErrorPipe,
  HttpRequestStates,
} from '../services/articles.service';
import { MockProvider } from 'ng-mocks';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiArticleListComponent } from '../ui-components/ui-article-list.component';
import { UiPaginationComponent } from '../ui-components/ui-pagination.component';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

// https://github.com/storybookjs/storybook/issues/22352 [Bug]: Angular: Unable to override Component Providers
// We have to create a child class with a new @Component() decorator to override the component level providers

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiArticleListComponent, UiPaginationComponent, HttpRequestStateErrorPipe],
  providers: [
    provideMockSignalStore(ArticleListSignalStore, {
      mockComputedSignals: false,
      initialStatePatch: {
        httpRequestState: HttpRequestStates.FETCHED,
        articles: [
          {
            'id': 1,
            'title': 'The Power of Positive Thinking: How Optimism Can Transform Your Life',
            'description':
              'Discover the incredible impact of positive thinking on your overall well-being. By adopting an optimistic mindset, you can improve your mental health, enhance resilience, and attract positivity into your life. Learn how to cultivate positivity and unlock your true potential.',
            'slug': 'the_power_of_positive_thinking_how_optimism_can_transform_your_life',
            'tagList': ['positive thinking', 'optimism', 'well-being'],
            'createdAt': '2023-04-15T09:30:00Z',
            'favoritesCount': 532,
            'author': {
              'username': 'John Doe',
              'image': 'assets/avatar32.png',
              'bio': '',
              'following': true,
            },
            'favorited': true,
          },
          {
            'id': 2,
            'title':
              'Exploring Sustainable Fashion: Redefining Style with Environmental Consciousness',
            'description':
              'Dive into the world of sustainable fashion and witness the innovative ways designers are integrating environmental consciousness into their creations. Discover ethical brands, eco-friendly materials, and the importance of making mindful fashion choices for a more sustainable future.',
            'slug':
              'exploring_sustainable_fashion_redefining_style_with_environmental_consciousness',
            'tagList': ['sustainable fashion', 'environmental consciousness', 'ethical brands'],
            'createdAt': '2023-04-16T14:45:00Z',
            'favoritesCount': 236,
            'author': {
              'username': 'Jane Smith',
              'image': 'assets/avatar32.png',
              'bio': '',
              'following': false,
            },
            'favorited': false,
          },
        ],
        articlesCount: 8,
      },
    }),
  ],
  templateUrl: 'article-list-signal-store.component.html',
})
class ArticleListComponent_SS_SB extends ArticleListComponent_SS {}

const meta: Meta<ArticleListComponent_SS_SB> = {
  title: 'ArticleListComponent_SS',
  component: ArticleListComponent_SS_SB,
  decorators: [
    applicationConfig({
      // we can override root level providers here
      providers: [MockProvider(ArticlesService)],
    }),
  ],
  render: (args: ArticleListComponent_SS_SB) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {},
};

export default meta;
type Story = StoryObj<ArticleListComponent_SS_SB>;

export const Primary: Story = {
  name: 'Play test example',
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const componentEl = canvasElement.querySelector('ng-component');
    // @ts-ignore
    const component = ng.getComponent(componentEl) as ArticleListComponent_SS;
    const mockStore = asMockSignalStore(component.store);

    mockStore.setSelectedPage.resetHistory();
    getRxMethodFake(mockStore.loadArticles).resetHistory();

    const nav = within(await canvas.findByRole('navigation'));
    const buttons = await nav.findAllByRole('button');

    // previous, 0, 1, 2 ...
    await userEvent.click(buttons[3]);
    await waitFor(() => {
      expect(getRxMethodFake(mockStore.loadArticles).callCount).toBe(1);
      expect(mockStore.setSelectedPage.callCount).toBe(1);
      expect(mockStore.setSelectedPage.lastCall.args).toEqual([2]);
    });
  },
};
