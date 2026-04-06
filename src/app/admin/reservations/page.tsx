// src/app/admin/reservations/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { APEX_VEHICLES } from "@/lib/data";
import {
  PageHeader, SectionCard, Table, TR, TD, Badge,
  FilterSelect, SearchInput, ActionBtn,
} from "@/components/admin/AdminUI";

interface Reservation {
  _id: string;
  confirmationCode: string;
  vehicleName: string;
  vehicleSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "pending";
  createdAt: string;
}

interface Pagination { total: number; page: number; pages: number }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination]     = useState<Pagination>({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]           = useState(true);
  const [status, setStatus]             = useState("all");
  const [vehicleId, setVehicleId]       = useState("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [cancelling, setCancelling]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status, vehicleId, page: String(page) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/reservations?${params}`);
    const d   = await res.json();
    setReservations(d.reservations ?? []);
    setPagination(d.pagination ?? { total: 0, page: 1, pages: 1 });
    setLoading(false);
  }, [status, vehicleId, search, page]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search, status, vehicleId]);

  const handleCancel = async (id: string, current: string) => {
    const next = current === "cancelled" ? "confirmed" : "cancelled";
    if (!confirm(`¿${next === "cancelled" ? "Cancelar" : "Reactivar"} esta reserva?`)) return;
    setCancelling(id);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    setCancelling(null);
    load();
  };

  const vehicleOptions = [
    { value: "all", label: "Todos los vehículos" },
    ...APEX_VEHICLES.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <div>
      <PageHeader
        title="Reservas"
        sub={`${pagination.total} reservas en total`}
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar nombre, email, código…" />
        <FilterSelect value={status} onChange={setStatus} options={[
          { value: "all",       label: "Todos los estados" },
          { value: "confirmed", label: "Confirmadas" },
          { value: "cancelled", label: "Canceladas" },
        ]} />
        <FilterSelect value={vehicleId} onChange={setVehicleId} options={vehicleOptions} />
        {loading && <span style={{ fontSize: "0.75rem", color: "#4B5563" }}>Cargando…</span>}
      </div>

      <SectionCard>
        <Table headers={["Código", "Vehículo", "Cliente", "Fechas", "Total", "Estado", ""]}>
          {reservations.map((r) => (
            <TR key={r._id}>
              <TD>
                <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#F59E0B", letterSpacing: "0.05em" }}>
                  {r.confirmationCode}
                </span>
              </TD>
              <TD>
                <div style={{ fontWeight: 500, fontSize: "0.82rem" }}>{r.vehicleName}</div>
                <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Slot {r.vehicleSlot}</div>
              </TD>
              <TD>
                <div style={{ fontSize: "0.82rem" }}>{r.customerName}</div>
                <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>{r.customerEmail}</div>
              </TD>
              <TD muted>
                <div style={{ fontSize: "0.78rem" }}>
                  {format(new Date(r.startDate), "dd MMM", { locale: es })}
                  {" → "}
                  {format(new Date(r.endDate), "dd MMM yyyy", { locale: es })}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#4B5563" }}>{r.totalDays} días</div>
              </TD>
              <TD style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", color: "#F59E0B", letterSpacing: "0.04em" }}>
                ${r.totalPrice.toLocaleString()}
              </TD>
              <TD><Badge variant={r.status as "confirmed" | "cancelled" | "pending"} /></TD>
              <TD>
                <ActionBtn
                  onClick={() => handleCancel(r._id, r.status)}
                  variant={r.status === "cancelled" ? "ghost" : "danger"}
                  disabled={cancelling === r._id}
                >
                  {cancelling === r._id ? "…" : r.status === "cancelled" ? "Reactivar" : "Cancelar"}
                </ActionBtn>
              </TD>
            </TR>
          ))}

          {!loading && reservations.length === 0 && (
            <TR>
              <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#4B5563", fontSize: "0.85rem" }}>
                No se encontraron reservas
              </td>
            </TR>
          )}
        </Table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#6B7280" }}>
              Página {pagination.page} de {pagination.pages}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <ActionBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} variant="ghost">← Anterior</ActionBtn>
              <ActionBtn onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} variant="ghost">Siguiente →</ActionBtn>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
