export type Role = "ADMIN" | "PRESSING";

export type User = {
  id: number;
  username: string;
  fullName: string;
  active: boolean;
  roles: Role[];
};

export type CreateUserPayload = {
  username: string;
  fullName: string;
  password: string;
  roles: Role[];
};

export type UpdateUserPayload = {
  fullName: string;
  password?: string;
  roles: Role[];
  active: boolean;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  PRESSING: "Pressing",
};
