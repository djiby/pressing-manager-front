"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, createTarif } from "@/lib/api";
import type { PricingType } from "@/types/tarif";
import { PRICING_TYPE_LABELS } from "@/types/tarif";

export default function NouveauTarifPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<PricingType>("PIECE");
  const [priceXof, setPriceXof] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const price = Number(priceXof);
    if (!Number.isInteger(price) || price < 1) {
      setError("Le prix doit être un entier positif en XOF.");
      setLoading(false);
      return;
    }

    try {
      await createTarif({
        name: name.trim(),
        type,
        priceXof: price,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Création impossible pour le moment",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Nouveau tarif"
      subtitle="Montants en francs CFA entiers (XOF)."
      actions={
        <Link
          href="/tarifs"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Retour
        </Link>
      }
    >
      <form
        onSubmit={onSubmit}
        className="grid w-full max-w-2xl gap-4 border border-line bg-panel p-4 sm:p-6"
      >
        <label className="text-sm font-medium">
          Nom
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Chemise, Lavage standard…"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Type
          <select
            required
            value={type}
            onChange={(e) => setType(e.target.value as PricingType)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          >
            <option value="KILO">{PRICING_TYPE_LABELS.KILO}</option>
            <option value="PIECE">{PRICING_TYPE_LABELS.PIECE}</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Prix (XOF)
          <input
            required
            type="number"
            min={1}
            step={1}
            value={priceXof}
            onChange={(e) => setPriceXof(e.target.value)}
            placeholder="1500"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brand px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Enregistrement réussi"
        message="Le tarif a bien été créé."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/tarifs")}
      />
    </AppShell>
  );
}
