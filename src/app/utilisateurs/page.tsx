"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SortableTh } from "@/components/SortableTh";
import { ApiError, listUsers } from "@/lib/api";
import { sortRows, toggleSort, type SortState } from "@/lib/sort";
import type { User } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

type UserSortKey = "fullName" | "username" | "roles" | "active";

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState<UserSortKey>>({
    key: "fullName",
    direction: "asc",
  });

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de charger les utilisateurs",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const sortedUsers = useMemo(
    () =>
      sortRows(users, sort, (user, key) => {
        switch (key as UserSortKey) {
          case "fullName":
            return user.fullName;
          case "username":
            return user.username;
          case "roles":
            return user.roles.map((role) => ROLE_LABELS[role]).join(", ");
          case "active":
            return user.active ? 1 : 0;
          default:
            return null;
        }
      }),
    [users, sort],
  );

  return (
    <AppShell
      title="Utilisateurs"
      subtitle="Comptes ADMIN et PRESSING."
      actions={
        <Link
          href="/utilisateurs/nouveau"
          className="bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Nouvel utilisateur
        </Link>
      }
    >
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-muted">Chargement des utilisateurs…</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">{users.length} utilisateur(s)</p>

          <div className="grid gap-3 md:hidden">
            {sortedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/utilisateurs/${user.id}`}
                className="border border-line bg-panel p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-brand">{user.fullName}</p>
                  <p
                    className={
                      user.active
                        ? "text-sm text-brand"
                        : "text-sm text-red-700"
                    }
                  >
                    {user.active ? "Actif" : "Inactif"}
                  </p>
                </div>
                <p className="mt-1 text-sm">{user.username}</p>
                <p className="mt-2 text-sm">
                  {user.roles.map((role) => ROLE_LABELS[role]).join(", ")}
                </p>
              </Link>
            ))}
            {sortedUsers.length === 0 && (
              <p className="border border-line bg-panel px-4 py-8 text-center text-sm text-muted">
                Aucun utilisateur.
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
                    label="Identifiant"
                    column="username"
                    sort={sort}
                    onSort={(column) => setSort((s) => toggleSort(s, column))}
                  />
                  <SortableTh
                    label="Rôles"
                    column="roles"
                    sort={sort}
                    onSort={(column) => setSort((s) => toggleSort(s, column))}
                  />
                  <SortableTh
                    label="Statut"
                    column="active"
                    sort={sort}
                    onSort={(column) => setSort((s) => toggleSort(s, column))}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/utilisateurs/${user.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {user.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">
                      {user.roles.map((role) => ROLE_LABELS[role]).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      {user.active ? "Actif" : "Inactif"}
                    </td>
                  </tr>
                ))}
                {sortedUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">
                      Aucun utilisateur.
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
