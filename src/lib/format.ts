const xofFormatter = new Intl.NumberFormat("fr", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

/** Formate un montant entier en francs CFA. */
export function formatXof(amount: number): string {
  return xofFormatter.format(amount);
}
