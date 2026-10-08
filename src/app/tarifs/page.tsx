"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApiError, searchTarifs } from "@/lib/api";
import { formatXof } from "@/lib/format";
import type { PricingType, Tarif } from "@/types/tarif";
import { PRICING_TYPE_LABELS } from "@/types/tarif";

export default function TarifsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PricingType | "">("");
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(q = query, selectedType = type) {
    setLoading(true);
    setError(null);
    try {
      const page = await searchTarifs(q, selectedType, 0, 100);
      setTarifs(page.content);
      setTotal(page.totalElements);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de charger les tarifs",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load(query.trim(), type);
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void load(query.trim(), type);
  }

  return (
    <AppShell
      title="Tarifs"
      subtitle="Grille kilo / pièce en francs CFA (XOF)."
      actions={
        <Link
          href="/tarifs/nouveau"
          className="bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Nouveau tarif
        </Link>
      }
    >
      <form
        onSubmit={onSearch}
        className="mb-6 flex flex-col gap-3 border border-line bg-panel p-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-sm font-medium">
          Recherche
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex. Chemise, lavage…"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium sm:w-48">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PricingType | "")}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          >
            <option value="">Tous</option>
            <option value="KILO">{PRICING_TYPE_LABELS.KILO}</option>
            <option value="PIECE">{PRICING_TYPE_LABELS.PIECE}</option>
          </select>
        </label>
        <button
          type="submit"
          className="border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-brand-soft"
        >
          Rechercher
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-muted">Chargement des tarifs…</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">{total} tarif(s)</p>
          <div className="overflow-x-auto border border-line bg-panel">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-brand-soft/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Prix</th>
                </tr>
              </thead>
              <tbody>
                {tarifs.map((tarif) => (
                  <tr key={tarif.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/tarifs/${tarif.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {tarif.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {PRICING_TYPE_LABELS[tarif.type]}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatXof(tarif.priceXof)}
                    </td>
                  </tr>
                ))}
                {tarifs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted">
                      Aucun tarif trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
