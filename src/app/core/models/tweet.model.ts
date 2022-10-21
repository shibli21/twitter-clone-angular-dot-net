export interface Tweet {
  id: string;
  type: string;
  userId: string;
  tweet: string;
  commentCount: number;
  likeCount: number;
  retweetCount: number;
  history: string[];
  user: User;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  tweetId: string;
  comment: string;
  createdAt: Date;
  user: User;
}

export interface PaginatedTweets {
  page: number;
  size: number;
  totalElements: number;
  lastPage: number;
  totalPages: number;
  tweets: Tweet[];
}

export interface Tweet {
  id: string;
  type: string;
  userId: string;
  tweet: string;
  commentCount: number;
  retweetRefId: string;
  likeCount: number;
  retweetCount: number;
  history: string[];
  isLiked: boolean;
  isRetweeted: boolean;
  user: User;
  refTweet: string;
  createdAt: Date;
}

export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  coverPictureUrl: string;
}
