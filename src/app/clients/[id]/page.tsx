"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, getClient, updateClient } from "@/lib/api";
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
  const [showSuccess, setShowSuccess] = useState(false);

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
        className="grid max-w-2xl gap-4 border border-line bg-panel p-6"
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

        <button
          type="submit"
          disabled={saving}
          className="bg-brand px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Enregistrement réussi"
        message="Les modifications du client ont bien été enregistrées."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/clients")}
      />
    </AppShell>
  );
}
