export type PricingType = "KILO" | "PIECE";

export type Tarif = {
  id: number;
  name: string;
  type: PricingType;
  priceXof: number;
  createdAt: string;
  updatedAt: string;
};

export type TarifPayload = {
  name: string;
  type: PricingType;
  priceXof: number;
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  KILO: "Au kilo",
  PIECE: "À la pièce",
};
