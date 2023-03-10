export interface IRegisterUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: Date;
  gender: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface ILoginResponse extends IUser {
  jwtToken: string;
  refreshToken: string;
  jwtExpiresIn: number;
  jwtExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  refreshTokenExpiresIn: number;
}

export interface IUser {
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
  bio: string;
  address: string;
  role: string;
  createdAt: Date;
  isFollowed?: boolean;
}

export interface IEditUser {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string;
  ProfilePicture: File;
  CoverPicture: File;
  dateOfBirth: Date;
  gender: string;
  bio: string;
  address: string;
}

export interface IPaginatedUsers {
  page: number;
  size: number;
  totalElements: number;
  lastPage: number;
  totalPages: number;
  users: IUser[];
}
export interface IPaginatedHashTags {
  page: number;
  size: number;
  totalElements: number;
  lastPage: number;
  totalPages: number;
  hashTags: string[];
}

export class PaginatedUsers {
  lastPage: number;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  users: IUser[];

  constructor() {
    this.lastPage = 0;
    this.page = 0;
    this.size = 0;
    this.totalElements = 0;
    this.totalPages = 0;
    this.users = [];
  }
}
