import type { PricingType } from "@/types/tarif";

export type OrderStatus = "RECEPTIONNEE" | "PRETE";

export type OrderLine = {
  id: number;
  tarifId: number | null;
  pricingType: PricingType;
  label: string;
  quantity: number;
  unitPriceXof: number;
  lineTotalXof: number;
};

export type Order = {
  id: number;
  reference: string;
  clientId: number;
  clientName: string;
  clientPhoneDisplay: string;
  status: OrderStatus;
  totalXof: number;
  notes: string | null;
  lines: OrderLine[];
  createdAt: string;
  updatedAt: string;
};

export type OrderLinePayload = {
  tarifId: number;
  quantity: number;
};

export type OrderPayload = {
  clientId: number;
  notes?: string;
  lines: OrderLinePayload[];
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEPTIONNEE: "Réceptionnée",
  PRETE: "Prête",
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEPTIONNEE: ["PRETE"],
  PRETE: [],
};
