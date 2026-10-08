export type Client = {
  id: number;
  fullName: string;
  phone: string;
  phoneDisplay: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ClientPayload = {
  fullName: string;
  phone: string;
  address?: string;
};
