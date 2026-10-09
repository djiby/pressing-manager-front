"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SortableTh } from "@/components/SortableTh";
import { ApiError, searchClients } from "@/lib/api";
import { sortRows, toggleSort, type SortState } from "@/lib/sort";
import type { Client } from "@/types/client";

const PAGE_SIZE = 5;

type ClientSortKey = "fullName" | "phoneDisplay" | "address";

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState<ClientSortKey>>({
    key: "fullName",
    direction: "asc",
  });

  async function load(q = query, page = pageIndex) {
    setLoading(true);
    setError(null);
    try {
      const result = await searchClients(q, page, PAGE_SIZE);
      setClients(result.content);
      setTotal(result.totalElements);
      setTotalPages(result.totalPages);
      setPageIndex(result.page);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de charger les clients",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load(query.trim(), pageIndex);
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pageIndex]);

  const sortedClients = useMemo(
    () =>
      sortRows(clients, sort, (client, key) => {
        switch (key as ClientSortKey) {
          case "fullName":
            return client.fullName;
          case "phoneDisplay":
            return client.phoneDisplay;
          case "address":
            return client.address ?? "";
          default:
            return null;
        }
      }),
    [clients, sort],
  );

  function onSearch(event: FormEvent) {
    event.preventDefault();
    if (pageIndex === 0) {
      void load(query.trim(), 0);
    } else {
      setPageIndex(0);
    }
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setPageIndex(0);
  }

  const from = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const to = Math.min((pageIndex + 1) * PAGE_SIZE, total);

  return (
    <AppShell
      title="Clients"
      subtitle="Recherche par nom ou téléphone."
      actions={
        <Link
          href="/clients/nouveau"
          className="bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Nouveau client
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
            placeholder="Ex. Aminata ou 77 123 45 67"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
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
        <p className="text-muted">Chargement des clients…</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            {total} client(s)
            {total > 0 && (
              <>
                {" "}
                · {from}–{to}
              </>
            )}
          </p>
          <div className="grid gap-3 md:hidden">
            {sortedClients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="border border-line bg-panel p-4"
              >
                <p className="font-medium text-brand">{client.fullName}</p>
                <p className="mt-1 text-sm">{client.phoneDisplay}</p>
                <p className="mt-1 text-sm text-muted">
                  {client.address || "—"}
                </p>
              </Link>
            ))}
            {sortedClients.length === 0 && (
              <p className="border border-line bg-panel px-4 py-8 text-center text-sm text-muted">
                Aucun client trouvé.
              </p>
            )}
          </div>

          <div className="hidden overflow-x-auto border border-line bg-panel md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-brand-soft/50">
                <tr>
                  <SortableTh
                    label="Nom"
                    column="fullName"
                    sort={sort}
                    onSort={(column) => setSort((s) => toggleSort(s, column))}
                  />
                  <SortableTh
                    label="Téléphone"
                    column="phoneDisplay"
                    sort={sort}
                    onSort={(column) => setSort((s) => toggleSort(s, column))}
                  />
                  <SortableTh
                    label="Adresse"
                    column="address"
                    sort={sort}
                    onSort={(column) => setSort((s) => toggleSort(s, column))}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client) => (
                  <tr key={client.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {client.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{client.phoneDisplay}</td>
                    <td className="px-4 py-3 text-muted">
                      {client.address || "—"}
                    </td>
                  </tr>
                ))}
                {sortedClients.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted">
                      Aucun client trouvé.
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
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  disabled={pageIndex <= 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  className="border border-line px-3 py-2 text-sm hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                  }
                  className="border border-line px-3 py-2 text-sm hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
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
