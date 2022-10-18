import { User } from './../../auth/Models/user.model';
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
