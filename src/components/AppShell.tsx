"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { fetchMe } from "@/lib/api";
import { clearSession, getStoredUser, isAuthenticated } from "@/lib/auth";
import type { User } from "@/types/auth";

const links = [
  { href: "/tableau-de-bord", label: "Tableau de bord" },
  { href: "/clients", label: "Clients" },
  { href: "/commandes", label: "Commandes" },
  { href: "/tarifs", label: "Tarifs" },
];

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/connexion");
      return;
    }

    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
    }

    fetchMe()
      .then((profile) => setUser(profile))
      .catch(() => {
        clearSession();
        router.replace("/connexion");
      })
      .finally(() => setReady(true));
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function logout() {
    clearSession();
    router.replace("/connexion");
  }

  if (!ready && !user) {
    return (
      <main className="flex min-h-screen items-center px-4 sm:px-6 md:pl-72">
        <p className="text-muted">Chargement…</p>
      </main>
    );
  }

  const navLinks = (
    <nav className="grid gap-1.5">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "bg-brand px-3 py-2.5 text-sm font-medium text-white"
                : "border border-transparent px-3 py-2.5 text-sm text-foreground hover:border-line hover:bg-brand-soft"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarFooter = (
    <div className="mt-auto border-t border-line pt-4">
      {user && (
        <p className="mb-3 break-words text-sm text-muted">
          {user.fullName}
          <span className="mt-1 block text-xs">{user.roles.join(", ")}</span>
        </p>
      )}
      <button
        type="button"
        onClick={logout}
        className="w-full border border-line bg-white px-3 py-2.5 text-sm font-medium hover:bg-brand-soft"
      >
        Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-panel md:flex">
        <div className="flex h-full flex-col px-4 py-6">
          <p className="mb-6 text-sm font-semibold tracking-[0.18em] text-brand uppercase">
            Pressing Manager
          </p>
          {navLinks}
          {sidebarFooter}
        </div>
      </aside>

      {/* Drawer mobile */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="mobile-nav"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-line bg-panel transition-transform duration-200 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold tracking-[0.18em] text-brand uppercase">
              Pressing Manager
            </p>
            <button
              type="button"
              className="border border-line px-3 py-1.5 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Fermer
            </button>
          </div>
          {navLinks}
          {sidebarFooter}
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-1 flex-col md:pl-64">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-panel/80 px-4 py-3 backdrop-blur md:hidden">
          <p className="text-sm font-semibold tracking-[0.18em] text-brand uppercase">
            Pressing Manager
          </p>
          <button
            type="button"
            className="border border-line bg-white px-3 py-2 text-sm font-medium"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
          <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-display)] text-2xl break-words text-foreground sm:text-3xl md:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center [&_a]:w-full [&_a]:text-center sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
                {actions}
              </div>
            )}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
