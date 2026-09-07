"use client";

import { useEffect, useMemo, useState } from "react";

type Prospect = {
  id: string;
  name: string;
  segment?: string | null;
  businessType?: string | null;
  size: string;
  employeeRange?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  neighborhood?: string | null;
  suggestedOffer?: string | null;
  suggestedPrice?: string | null;
  score: number;
  priority: string;
  status: string;
};

const statuses = ["PENDING","RESEARCHED","CONTACTED","RESPONDED","INTERESTED","QUOTED","WON","LOST","DISCARDED"];

export default function HomePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const r = await fetch(`/api/prospects?${params.toString()}`, { cache: "no-store" });
    setProspects(await r.json());
  }

  useEffect(() => { load(); }, [status]);

  const metrics = useMemo(() => ({
    total: prospects.length,
    pending: prospects.filter(p => p.status === "PENDING").length,
    interested: prospects.filter(p => p.status === "INTERESTED").length,
    won: prospects.filter(p => p.status === "WON").length,
  }), [prospects]);

  async function updateProspect(p: Prospect, patch: Partial<Prospect>) {
    const r = await fetch(`/api/prospects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated = await r.json();
    setProspects(items => items.map(x => x.id === p.id ? updated : x));
    if (selected?.id === p.id) setSelected(updated);
  }

  async function generateMessage(p: Prospect) {
    const r = await fetch("/api/messages/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId: p.id }),
    });
    const data = await r.json();
    setGenerated(data.message || "");
    if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank");
  }

  async function importFile(form: FormData) {
    setLoading(true);
    const r = await fetch("/api/import", { method: "POST", body: form });
    const data = await r.json();
    alert(`Importados: ${data.imported ?? 0}`);
    await load();
    setLoading(false);
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>PROSPECT2</h1>
          <p>CRM de prospección para negocios pequeños y medianos.</p>
        </div>
        <form action={importFile} className="importer">
          <input name="file" type="file" accept=".xlsx,.xls,.csv" required />
          <select name="dataset" defaultValue="Pequeñas empresas">
            <option>Pequeñas empresas</option>
            <option>Medianas empresas</option>
          </select>
          <button disabled={loading}>{loading ? "Importando..." : "Importar Excel"}</button>
        </form>
      </header>

      <section className="metrics">
        <Card label="Prospectos" value={metrics.total} />
        <Card label="Pendientes" value={metrics.pending} />
        <Card label="Interesados" value={metrics.interested} />
        <Card label="Ganados" value={metrics.won} />
      </section>

      <section className="toolbar">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar negocio, giro, teléfono..." onKeyDown={e => e.key === "Enter" && load()} />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load}>Buscar</button>
      </section>

      <section className="layout">
        <div className="tableWrap">
          <table>
            <thead><tr><th>Negocio</th><th>Tipo</th><th>Teléfono</th><th>Oferta</th><th>Prioridad</th><th>Estado</th></tr></thead>
            <tbody>
              {prospects.map(p => (
                <tr key={p.id} onClick={() => { setSelected(p); setGenerated(""); }} className={selected?.id === p.id ? "active" : ""}>
                  <td><strong>{p.name}</strong><small>{p.segment || "Sin giro"}</small></td>
                  <td>{p.businessType || p.employeeRange || p.size}</td>
                  <td>{p.phone || "Pendiente"}</td>
                  <td>{p.suggestedOffer || "Definir"}</td>
                  <td>{p.priority} · {p.score}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="panel">
          {!selected ? <p>Selecciona un prospecto para editarlo y generar mensajes.</p> : <>
            <h2>{selected.name}</h2>
            <label>Teléfono<input value={selected.phone || ""} onChange={e => setSelected({...selected, phone:e.target.value})} onBlur={() => updateProspect(selected,{phone:selected.phone})} /></label>
            <label>WhatsApp<input value={selected.whatsapp || ""} onChange={e => setSelected({...selected, whatsapp:e.target.value})} onBlur={() => updateProspect(selected,{whatsapp:selected.whatsapp})} /></label>
            <label>Email<input value={selected.email || ""} onChange={e => setSelected({...selected, email:e.target.value})} onBlur={() => updateProspect(selected,{email:selected.email})} /></label>
            <label>Web<input value={selected.website || ""} onChange={e => setSelected({...selected, website:e.target.value})} onBlur={() => updateProspect(selected,{website:selected.website})} /></label>
            <label>Oferta<input value={selected.suggestedOffer || ""} onChange={e => setSelected({...selected, suggestedOffer:e.target.value})} onBlur={() => updateProspect(selected,{suggestedOffer:selected.suggestedOffer})} /></label>
            <label>Precio<input value={selected.suggestedPrice || ""} onChange={e => setSelected({...selected, suggestedPrice:e.target.value})} onBlur={() => updateProspect(selected,{suggestedPrice:selected.suggestedPrice})} /></label>
            <label>Estado<select value={selected.status} onChange={e => updateProspect(selected,{status:e.target.value})}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
            <button className="primary" onClick={() => generateMessage(selected)}>Generar mensaje y abrir WhatsApp</button>
            {generated && <textarea className="message" value={generated} readOnly rows={8} />}
          </>}
        </aside>
      </section>
    </main>
  );
}

function Card({label,value}:{label:string,value:number}) {
  return <div className="card"><span>{label}</span><strong>{value}</strong></div>;
}
