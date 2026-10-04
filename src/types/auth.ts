export type Role = "ADMIN" | "CAISSIER" | "PRESSING" | "LECTURE";

export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  active: boolean;
  roles: Role[];
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
};
