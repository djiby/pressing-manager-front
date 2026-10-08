"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ClientSearchSelect } from "@/components/ClientSearchSelect";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, createOrder, searchTarifs } from "@/lib/api";
import { formatXof } from "@/lib/format";
import type { Client } from "@/types/client";
import type { Tarif } from "@/types/tarif";
import { PRICING_TYPE_LABELS } from "@/types/tarif";

type DraftLine = {
  key: string;
  tarifId: string;
  quantity: string;
};

function newLine(): DraftLine {
  return {
    key: `${Date.now()}-${Math.random()}`,
    tarifId: "",
    quantity: "1",
  };
}

export default function NouvelleCommandePage() {
  const router = useRouter();
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    searchTarifs("", "", 0, 100)
      .then((tarifsPage) => setTarifs(tarifsPage.content))
      .catch(() => setError("Impossible de charger les tarifs"))
      .finally(() => setLoading(false));
  }, []);

  const estimatedTotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const tarif = tarifs.find((t) => String(t.id) === line.tarifId);
      const qty = Number(line.quantity);
      if (!tarif || !Number.isFinite(qty) || qty <= 0) {
        return sum;
      }
      if (tarif.type === "PIECE") {
        if (!Number.isInteger(qty)) {
          return sum;
        }
        return sum + qty * tarif.priceXof;
      }
      return sum + Math.round(qty * tarif.priceXof);
    }, 0);
  }, [lines, tarifs]);

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (!selectedClient) {
      setError("Sélectionnez un client.");
      setSaving(false);
      return;
    }

    const payloadLines = [];
    for (const line of lines) {
      const tarifId = Number(line.tarifId);
      const quantity = Number(line.quantity);
      if (!Number.isFinite(tarifId) || !Number.isFinite(quantity) || quantity <= 0) {
        setError("Chaque ligne doit avoir un tarif et une quantité valide.");
        setSaving(false);
        return;
      }
      payloadLines.push({ tarifId, quantity });
    }

    if (payloadLines.length === 0) {
      setError("Ajoutez au moins une ligne.");
      setSaving(false);
      return;
    }

    try {
      await createOrder({
        clientId: selectedClient.id,
        notes: notes.trim() || undefined,
        lines: payloadLines,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Création de commande impossible",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Nouvelle commande">
        <p className="text-muted">Chargement…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Nouvelle commande"
      subtitle="Recherchez ou créez un client, puis ajoutez les tarifs (kilo / pièce)."
      actions={
        <Link
          href="/commandes"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Retour
        </Link>
      }
    >
      <form
        onSubmit={onSubmit}
        className="grid w-full max-w-3xl gap-4 border border-line bg-panel p-4 sm:p-6"
      >
        <div className="text-sm font-medium">
          Client
          <ClientSearchSelect
            value={selectedClient}
            onChange={setSelectedClient}
            disabled={saving}
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold">Lignes</h2>
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, newLine()])}
              className="border border-line px-3 py-2 text-sm hover:bg-brand-soft"
            >
              Ajouter une ligne
            </button>
          </div>

          {lines.map((line) => {
            const tarif = tarifs.find((t) => String(t.id) === line.tarifId);
            return (
              <div
                key={line.key}
                className="grid gap-3 border border-line p-3 sm:grid-cols-[1fr_8rem_auto]"
              >
                <label className="text-sm font-medium">
                  Tarif
                  <select
                    required
                    value={line.tarifId}
                    onChange={(e) =>
                      updateLine(line.key, { tarifId: e.target.value })
                    }
                    className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
                  >
                    <option value="">Choisir</option>
                    {tarifs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {PRICING_TYPE_LABELS[t.type]} ·{" "}
                        {formatXof(t.priceXof)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  {tarif?.type === "KILO" ? "Kg" : "Quantité"}
                  <input
                    required
                    type="number"
                    min={tarif?.type === "KILO" ? 0.001 : 1}
                    step={tarif?.type === "KILO" ? 0.001 : 1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.key, { quantity: e.target.value })
                    }
                    className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
                  />
                </label>
                <button
                  type="button"
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((prev) => prev.filter((l) => l.key !== line.key))
                  }
                  className="self-end border border-red-700 px-3 py-2 text-sm text-red-700 disabled:opacity-40"
                >
                  Retirer
                </button>
              </div>
            );
          })}
        </div>

        <label className="text-sm font-medium">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>

        <p className="text-sm">
          Total estimé :{" "}
          <span className="font-semibold">{formatXof(estimatedTotal)}</span>
        </p>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Créer la commande"}
        </button>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Commande créée"
        message="La commande a bien été enregistrée."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/commandes")}
      />
    </AppShell>
  );
}
