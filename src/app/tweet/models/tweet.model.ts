export interface Tweet {
  id: string;
  type: string;
  userId: string;
  tweet: string;
  commentCount: number;
  likeCount: number;
  history: any[];
  createdAt: Date;
}
