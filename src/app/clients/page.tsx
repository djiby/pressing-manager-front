"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApiError, searchClients } from "@/lib/api";
import type { Client } from "@/types/client";

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(q = query) {
    setLoading(true);
    setError(null);
    try {
      const page = await searchClients(q, 0, 50);
      setClients(page.content);
      setTotal(page.totalElements);
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
      void load(query.trim());
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void load(query.trim());
  }

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
            onChange={(e) => setQuery(e.target.value)}
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
          <p className="mb-3 text-sm text-muted">{total} client(s)</p>
          <div className="overflow-x-auto border border-line bg-panel">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-brand-soft/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Téléphone</th>
                  <th className="px-4 py-3 font-semibold">Adresse</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
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
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted">
                      Aucun client trouvé.
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
