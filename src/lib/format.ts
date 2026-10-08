const xofFormatter = new Intl.NumberFormat("fr", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

/** Formate un montant entier en francs CFA. */
export function formatXof(amount: number): string {
  return xofFormatter.format(amount);
}

/** Formate une date ISO (Instant) en date/heure locale FR. */
export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}
