export interface PaginatedNotifications {
  page: number;
  size: number;
  totalElements: number;
  lastPage: number;
  totalPages: number;
  totalUnread: number;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: string;
  userId: string;
  refUserId: string;
  tweetId: string;
  isRead: boolean;
  refUser: RefUser;
  message: string;
  createdAt: Date;
}

export interface RefUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string;
  coverPictureUrl: string;
  dateOfBirth: Date;
  gender: string;
  followers: number;
  following: number;
  address: string;
  bio: string;
  role: string;
  createdAt: Date;
}
