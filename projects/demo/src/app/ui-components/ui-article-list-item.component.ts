import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../models/article.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixHeart, radixHeartFilled } from '@ng-icons/radix-icons';

@Component({
  selector: 'app-ui-article-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent, CommonModule],
  viewProviders: [provideIcons({ radixHeart, radixHeartFilled })],
  template: `
@if (article(); as a) {
  <div class="bg-white shadow-sm border rounded-md p-6 mb-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <!-- Author's Photo -->
      <img [src]="a.author.image" alt="{{a.author.username}}'s Photo" class="h-8 w-8 rounded-full mr-2">

      <!-- Author's Name -->
      <div class="text-sm">
        <p class="text-gray-800 font-semibold">{{ a.author.username }}</p>
        <p class="text-gray-500">{{ a.createdAt | date: 'longDate' }}</p>
      </div>
    </div>

    <!-- Like Count with Heart Icon -->
    <button href="#" class="text-sm text-gray-500 flex items-center"
      (click)="toggleFavorite.emit(a.id)">
      <ng-icon [name]="a.favorited ? 'radixHeartFilled' : 'radixHeart'" style="padding-top: 1px;"/>
      <span class="pl-1">{{ a.favoritesCount }}</span>
    </button>
  </div>

  <!-- Article Title -->
  <h2 class="text-xl font-semibold mt-4 mb-2">{{ a.title }}</h2>

  <!-- Article Summary -->
  <p class="text-gray-600 text-sm">{{ a.description }}</p>

  <!-- Read More Button -->
  <a href="#" class="hover:underline mt-2 inline-block">Read More...</a>

  <!-- Tags -->
  <div class="mt-4 flex flex-wrap justify-end">
    @for (tag of a.tagList; track $index) {
      <span class="inline-block bg-yellow-100 text-gray-700 text-xs px-2 py-1 rounded-full ml-2 mt-2">{{ tag }}</span>
    }
  </div>
</div>
}
  `
})
export class UiArticleLisItemComponent {
  article = input.required<Article>();
  @Output() toggleFavorite = new EventEmitter<number>();
}
