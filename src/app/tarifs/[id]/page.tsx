"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, deleteTarif, getTarif, updateTarif } from "@/lib/api";
import type { PricingType, Tarif } from "@/types/tarif";
import { PRICING_TYPE_LABELS } from "@/types/tarif";

export default function TarifDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tarifId = Number(params.id);

  const [tarif, setTarif] = useState<Tarif | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<PricingType>("PIECE");
  const [priceXof, setPriceXof] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(tarifId)) {
      router.replace("/tarifs");
      return;
    }

    getTarif(tarifId)
      .then((data) => {
        setTarif(data);
        setName(data.name);
        setType(data.type);
        setPriceXof(String(data.priceXof));
      })
      .catch(() => router.replace("/tarifs"))
      .finally(() => setLoading(false));
  }, [tarifId, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!tarif) {
      return;
    }

    const price = Number(priceXof);
    if (!Number.isInteger(price) || price < 1) {
      setError("Le prix doit être un entier positif en XOF.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateTarif(tarif.id, {
        name: name.trim(),
        type,
        priceXof: price,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Mise à jour impossible",
      );
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDelete() {
    if (!tarif) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteTarif(tarif.id);
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      setShowDeleteConfirm(false);
      setError(
        err instanceof ApiError ? err.message : "Suppression impossible",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !tarif) {
    return (
      <AppShell title="Tarif">
        <p className="text-muted">Chargement…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={tarif.name}
      subtitle={`${PRICING_TYPE_LABELS[tarif.type]} · édition`}
      actions={
        <Link
          href="/tarifs"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Liste des tarifs
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
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving || deleting}
            className="flex-1 bg-brand px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-red-700 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Supprimer
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Enregistrement réussi"
        message="Les modifications du tarif ont bien été enregistrées."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/tarifs")}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Supprimer ce tarif ?"
        message={`Le tarif « ${tarif.name} » sera définitivement supprimé.`}
        confirmLabel={deleting ? "Suppression…" : "Supprimer"}
        cancelLabel="Annuler"
        danger
        onConfirm={() => {
          if (!deleting) {
            void onConfirmDelete();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteSuccess}
        title="Tarif supprimé"
        message="Le tarif a bien été supprimé."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/tarifs")}
      />
    </AppShell>
  );
}
