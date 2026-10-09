"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ApiError, createClient, searchClients } from "@/lib/api";
import type { Client } from "@/types/client";

type ClientSearchSelectProps = {
  value: Client | null;
  onChange: (client: Client | null) => void;
  disabled?: boolean;
  allowCreate?: boolean;
};

export function ClientSearchSelect({
  value,
  onChange,
  disabled = false,
  allowCreate = true,
}: ClientSearchSelectProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (value || createMode) {
      return;
    }

    const handle = window.setTimeout(() => {
      setLoading(true);
      searchClients(query.trim(), 0, 20)
        .then((page) => setResults(page.content))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, value, createMode]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function openCreateForm(seedQuery = "") {
    const looksLikePhone = /\d/.test(seedQuery);
    setCreateMode(true);
    setOpen(false);
    setCreateError(null);
    setFullName(looksLikePhone ? "" : seedQuery);
    setPhone(looksLikePhone ? seedQuery : "");
    setAddress("");
  }

  async function onCreateSubmit() {
    if (!fullName.trim() || !phone.trim()) {
      setCreateError("Nom et téléphone sont obligatoires.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const client = await createClient({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      });
      onChange(client);
      setCreateMode(false);
      setQuery("");
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : "Création du client impossible",
      );
    } finally {
      setCreating(false);
    }
  }

  if (value) {
    return (
      <div className="mt-2 flex items-center justify-between gap-3 border border-line bg-white px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{value.fullName}</p>
          <p className="truncate text-sm text-muted">{value.phoneDisplay}</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onChange(null);
            setQuery("");
            setCreateMode(false);
            setOpen(true);
          }}
          className="shrink-0 border border-line px-3 py-1.5 text-sm hover:bg-brand-soft disabled:opacity-60"
        >
          Changer
        </button>
      </div>
    );
  }

  if (createMode && allowCreate) {
    return (
      <div className="mt-2 grid gap-3 border border-line bg-white p-4">
        <p className="text-sm font-semibold text-foreground">Nouveau client</p>
        <label className="text-sm font-medium">
          Nom complet
          <input
            required
            value={fullName}
            disabled={disabled || creating}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onCreateSubmit();
              }
            }}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Téléphone
          <input
            required
            value={phone}
            disabled={disabled || creating}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onCreateSubmit();
              }
            }}
            placeholder="77 123 45 67"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Adresse
          <input
            value={address}
            disabled={disabled || creating}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onCreateSubmit();
              }
            }}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>

        {createError && <p className="text-sm text-red-700">{createError}</p>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={disabled || creating}
            onClick={() => void onCreateSubmit()}
            className="bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {creating ? "Création…" : "Créer et sélectionner"}
          </button>
          <button
            type="button"
            disabled={disabled || creating}
            onClick={() => {
              setCreateMode(false);
              setCreateError(null);
              setOpen(true);
            }}
            className="border border-line px-4 py-2 text-sm hover:bg-brand-soft disabled:opacity-60"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative mt-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          disabled={disabled}
          placeholder="Rechercher par nom ou téléphone…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand disabled:opacity-60"
        />
        {allowCreate && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => openCreateForm(query.trim())}
            className="shrink-0 border border-line bg-panel px-3 py-2 text-sm font-medium hover:bg-brand-soft disabled:opacity-60"
          >
            Nouveau client
          </button>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto border border-line bg-panel shadow-[0_12px_30px_rgba(28,42,34,0.12)]"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-muted">Recherche…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2">
              <p className="text-sm text-muted">Aucun client trouvé</p>
              {allowCreate && (
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-brand hover:underline"
                  onClick={() => openCreateForm(query.trim())}
                >
                  Créer un nouveau client
                </button>
              )}
            </li>
          )}
          {!loading &&
            results.map((client) => (
              <li key={client.id}>
                <button
                  type="button"
                  role="option"
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-brand-soft"
                  onClick={() => {
                    onChange(client);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-medium">{client.fullName}</span>
                  <span className="text-muted">{client.phoneDisplay}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
