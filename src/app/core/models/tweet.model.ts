export class PaginatedTweets {
  lastPage: number;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  tweets: ITweet[];

  constructor() {
    this.lastPage = 0;
    this.page = 0;
    this.size = 0;
    this.totalElements = 0;
    this.totalPages = 0;
    this.tweets = [];
  }
}

export interface IPaginatedTweets {
  page: number;
  size: number;
  totalElements: number;
  lastPage: number;
  totalPages: number;
  tweets: ITweet[];
}

export interface ITweet {
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
  refTweet: ITweet | null;
  createdAt: Date;
}

export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  coverPictureUrl: string;
  dateOfBirth: Date;
  address: string;
  bio: string;
}

export interface IPaginatedComments {
  page: number;
  size: number;
  totalElements: number;
  lastPage: number;
  totalPages: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  tweetId: string;
  comment: string;
  createdAt: Date;
  user: User;
}
