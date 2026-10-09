import type { PricingType } from "@/types/tarif";

export type OrderStatus = "RECEPTIONNEE" | "PRETE";

export type PaymentStatus = "NON_PAYE" | "PAYE";

export type PaymentMethod = "ESPECE" | "WAVE" | "ORANGE_MONEY";

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
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  totalXof: number;
  notes: string | null;
  lines: OrderLine[];
  invoiceId: number | null;
  invoiceNumber: string | null;
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
  paymentMethod?: PaymentMethod | null;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEPTIONNEE: "Réceptionnée",
  PRETE: "Prête",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NON_PAYE: "Non payé",
  PAYE: "Payé",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ESPECE: "Espèce",
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
};

export const PAYMENT_METHODS = Object.keys(
  PAYMENT_METHOD_LABELS,
) as PaymentMethod[];

export function paymentLabel(order: {
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
}): string {
  if (order.paymentMethod) {
    return PAYMENT_METHOD_LABELS[order.paymentMethod];
  }
  return PAYMENT_STATUS_LABELS[order.paymentStatus];
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEPTIONNEE: ["PRETE"],
  PRETE: [],
};
