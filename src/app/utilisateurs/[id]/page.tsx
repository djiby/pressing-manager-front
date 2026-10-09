"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, getUser, updateUser } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import type { Role, User } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

export default function UtilisateurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(params.id);
  const currentUser = getStoredUser();

  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PRESSING");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(userId)) {
      router.replace("/utilisateurs");
      return;
    }

    getUser(userId)
      .then((data) => {
        setUser(data);
        setFullName(data.fullName);
        setRole(data.roles.includes("ADMIN") ? "ADMIN" : "PRESSING");
        setActive(data.active);
      })
      .catch(() => router.replace("/utilisateurs"))
      .finally(() => setLoading(false));
  }, [userId, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateUser(user.id, {
        fullName: fullName.trim(),
        password: password.trim() || undefined,
        roles: [role],
        active,
      });
      setUser(updated);
      setPassword("");
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Mise à jour impossible",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <AppShell title="Utilisateur">
        <p className="text-muted">Chargement…</p>
      </AppShell>
    );
  }

  const isSelf = currentUser?.id === user.id;

  return (
    <AppShell
      title={user.fullName}
      subtitle={`@${user.username}`}
      actions={
        <Link
          href="/utilisateurs"
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
          Identifiant
          <input
            value={user.username}
            disabled
            className="mt-2 w-full border border-line bg-brand-soft/40 px-3 py-2 text-muted"
          />
        </label>
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
          Nouveau mot de passe
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            autoComplete="new-password"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Rôle
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          >
            {(Object.keys(ROLE_LABELS) as Role[]).map((key) => (
              <option key={key} value={key}>
                {ROLE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={active}
            disabled={isSelf}
            onChange={(e) => setActive(e.target.checked)}
            className="size-4 accent-[var(--brand)]"
          />
          Compte actif
          {isSelf && (
            <span className="font-normal text-muted">
              (vous ne pouvez pas désactiver votre propre compte)
            </span>
          )}
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
        message="Les modifications de l'utilisateur ont bien été enregistrées."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/utilisateurs")}
      />
    </AppShell>
  );
}
