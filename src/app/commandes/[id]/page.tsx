"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ApiError,
  deleteOrder,
  getOrder,
  updateOrderStatus,
} from "@/lib/api";
import { formatXof } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/order";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
} from "@/types/order";
import { PRICING_TYPE_LABELS } from "@/types/tarif";

export default function CommandeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      router.replace("/commandes");
      return;
    }

    getOrder(orderId)
      .then(setOrder)
      .catch(() => router.replace("/commandes"))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  async function changeStatus(next: OrderStatus) {
    if (!order) {
      return;
    }
    setUpdating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await updateOrderStatus(order.id, next);
      setOrder(updated);
      setStatusMessage(`Statut mis à jour : ${ORDER_STATUS_LABELS[next]}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Changement de statut impossible",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function onConfirmDelete() {
    if (!order) {
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      await deleteOrder(order.id);
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      setShowDeleteConfirm(false);
      setError(
        err instanceof ApiError ? err.message : "Suppression impossible",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) {
    return (
      <AppShell title="Commande">
        <p className="text-muted">Chargement…</p>
      </AppShell>
    );
  }

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
  const canDelete = order.status === "RECEPTIONNEE";

  return (
    <AppShell
      title={order.reference}
      subtitle={`${order.clientName} · ${order.clientPhoneDisplay}`}
      actions={
        <Link
          href="/commandes"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Liste des commandes
        </Link>
      }
    >
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Statut</h2>
          <p className="mt-2 text-lg font-semibold">
            {ORDER_STATUS_LABELS[order.status]}
          </p>
        </article>
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Total</h2>
          <p className="mt-2 text-lg font-semibold">
            {formatXof(order.totalXof)}
          </p>
        </article>
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Notes</h2>
          <p className="mt-2 text-sm">{order.notes || "—"}</p>
        </article>
      </section>

      {nextStatuses.length > 0 && (
        <section className="mb-6 border border-line bg-panel p-4">
          <h2 className="mb-3 text-sm font-semibold">Changer le statut</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updating}
                onClick={() => void changeStatus(status)}
                className="bg-brand px-3 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
              >
                {ORDER_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="overflow-x-auto border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-brand-soft/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Article</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Qté</th>
              <th className="px-4 py-3 font-semibold">P.U.</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{line.label}</td>
                <td className="px-4 py-3">
                  {PRICING_TYPE_LABELS[line.pricingType]}
                </td>
                <td className="px-4 py-3">{line.quantity}</td>
                <td className="px-4 py-3">{formatXof(line.unitPriceXof)}</td>
                <td className="px-4 py-3 font-medium">
                  {formatXof(line.lineTotalXof)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statusMessage && (
        <p className="mt-4 text-sm text-brand">{statusMessage}</p>
      )}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {canDelete && (
        <button
          type="button"
          disabled={updating}
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-6 border border-red-700 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Supprimer la commande
        </button>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Supprimer cette commande ?"
        message={`La commande ${order.reference} sera définitivement supprimée.`}
        confirmLabel={updating ? "Suppression…" : "Supprimer"}
        cancelLabel="Annuler"
        danger
        onConfirm={() => {
          if (!updating) {
            void onConfirmDelete();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteSuccess}
        title="Commande supprimée"
        message="La commande a bien été supprimée."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/commandes")}
      />
    </AppShell>
  );
}
