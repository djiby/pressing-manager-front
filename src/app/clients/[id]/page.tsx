"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, deleteClient, getClient, updateClient } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import type { Client } from "@/types/client";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = Number(params.id);

  const [client, setClient] = useState<Client | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(clientId)) {
      router.replace("/clients");
      return;
    }

    getClient(clientId)
      .then((data) => {
        setClient(data);
        setFullName(data.fullName);
        setPhone(data.phone);
        setAddress(data.address ?? "");
      })
      .catch(() => router.replace("/clients"))
      .finally(() => setLoading(false));
  }, [clientId, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!client) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateClient(client.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
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
    if (!client) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteClient(client.id);
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

  if (loading || !client) {
    return (
      <AppShell title="Client">
        <p className="text-muted">Chargement…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={client.fullName}
      subtitle={`Fiche client · ${client.phoneDisplay}`}
      actions={
        <Link
          href="/clients"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Liste des clients
        </Link>
      }
    >
      <div className="mb-6 border border-line bg-panel p-4 text-sm text-muted">
        Historique des commandes : disponible à l&apos;étape Commandes.
      </div>

      <form
        onSubmit={onSubmit}
        className="grid w-full max-w-2xl gap-4 border border-line bg-panel p-4 sm:p-6"
      >
        <label className="text-sm font-medium">
          Nom complet
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Téléphone
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Adresse
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
          {isAdmin() && (
            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-700 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Supprimer
            </button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Enregistrement réussi"
        message="Les modifications du client ont bien été enregistrées."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/clients")}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Supprimer ce client ?"
        message={`Le client « ${client.fullName} » sera définitivement supprimé.`}
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
        title="Client supprimé"
        message="Le client a bien été supprimé."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/clients")}
      />
    </AppShell>
  );
}
