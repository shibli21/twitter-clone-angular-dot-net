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

export interface LoginResponse {
  userName: string;
  jwtToken: string;
  refreshToken: string;
  jwtExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  blockedAt: null;
}
