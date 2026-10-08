"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApiError, searchOrders } from "@/lib/api";
import { formatDateTime, formatXof } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "@/types/order";

const PAGE_SIZE = 5;

export default function CommandesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [pageIndex, setPageIndex] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(
    q = query,
    selectedStatus = status,
    page = pageIndex,
  ) {
    setLoading(true);
    setError(null);
    try {
      const result = await searchOrders(
        q,
        selectedStatus,
        undefined,
        page,
        PAGE_SIZE,
      );
      setOrders(result.content);
      setTotal(result.totalElements);
      setTotalPages(result.totalPages);
      setPageIndex(result.page);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de charger les commandes",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load(query.trim(), status, pageIndex);
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, pageIndex]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    if (pageIndex === 0) {
      void load(query.trim(), status, 0);
    } else {
      setPageIndex(0);
    }
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setPageIndex(0);
  }

  function onStatusChange(value: OrderStatus | "") {
    setStatus(value);
    setPageIndex(0);
  }

  const from = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const to = Math.min((pageIndex + 1) * PAGE_SIZE, total);

  return (
    <AppShell
      title="Commandes"
      subtitle="Commandes du mois en cours (kilo et pièce)."
      actions={
        <Link
          href="/commandes/nouvelle"
          className="bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Nouvelle commande
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
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Référence, client, téléphone…"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium sm:w-52">
          Statut
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus | "")}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          >
            <option value="">Tous</option>
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((key) => (
              <option key={key} value={key}>
                {ORDER_STATUS_LABELS[key]}
              </option>
            ))}
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
        <p className="text-muted">Chargement des commandes…</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            {total} commande(s)
            {total > 0 && (
              <>
                {" "}
                · {from}–{to}
              </>
            )}
          </p>
          <div className="overflow-x-auto border border-line bg-panel">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-brand-soft/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/commandes/${order.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div>{order.clientName}</div>
                      <div className="text-muted">{order.clientPhoneDisplay}</div>
                    </td>
                    <td className="px-4 py-3">
                      {ORDER_STATUS_LABELS[order.status]}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatXof(order.totalXof)}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border border-line bg-panel px-4 py-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted">
                Page {pageIndex + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pageIndex <= 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  className="border border-line px-3 py-1.5 text-sm hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                  }
                  className="border border-line px-3 py-1.5 text-sm hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
