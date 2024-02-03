export type Profile = {
  readonly bio: string;
  readonly following: boolean;
  readonly image: string;
  readonly username: string;
};

export type Article = {
  readonly id: number;
  readonly author: Profile;
  readonly body?: string;
  readonly createdAt: string;
  readonly description: string;
  readonly favorited: boolean;
  readonly favoritesCount: number;
  readonly slug: string;
  readonly tagList: ReadonlyArray<string>;
  readonly title: string;
  readonly updatedAt?: string;
};

export type Articles = ReadonlyArray<Article>;
