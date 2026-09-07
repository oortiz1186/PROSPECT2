"use client";

import { useEffect, useMemo, useState } from "react";

type Interaction = {
  id: string;
  channel: string;
  summary: string;
  happenedAt: string;
};

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
  contactName?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  neighborhood?: string | null;
  suggestedOffer?: string | null;
  suggestedPrice?: string | null;
  salesArgument?: string | null;
  notes?: string | null;
  nextFollowUpAt?: string | null;
  lastContactAt?: string | null;
  score: number;
  priority: string;
  status: string;
  interactions?: Interaction[];
};

type MessageType = "FIRST_CONTACT" | "FOLLOW_UP" | "WEB" | "SUPPORT" | "AUTOMATION" | "QUOTE";

const statuses = ["PENDING","RESEARCHED","CONTACTED","RESPONDED","INTERESTED","QUOTED","WON","LOST","DISCARDED"];
const activeKanban = ["PENDING","RESEARCHED","CONTACTED","RESPONDED","INTERESTED","QUOTED","WON"];
const labels: Record<string,string> = {
  PENDING:"Pendiente", RESEARCHED:"Investigado", CONTACTED:"Contactado", RESPONDED:"Respondió",
  INTERESTED:"Interesado", QUOTED:"Cotizado", WON:"Ganado", LOST:"Perdido", DISCARDED:"Descartado"
};
const messageLabels: Record<MessageType,string> = {
  FIRST_CONTACT:"Primer contacto", FOLLOW_UP:"Seguimiento", WEB:"Página / landing", SUPPORT:"Soporte TI", AUTOMATION:"Automatización", QUOTE:"Seguimiento de cotización"
};

export default function HomePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dataset, setDataset] = useState("");
  const [priority, setPriority] = useState("");
  const [view, setView] = useState<"LIST"|"KANBAN">("LIST");
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [generated, setGenerated] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("FIRST_CONTACT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [interactionChannel, setInteractionChannel] = useState("WHATSAPP");
  const [interactionSummary, setInteractionSummary] = useState("");

  async function load() {
    try {
      setError("");
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (dataset) params.set("dataset", dataset);
      if (priority) params.set("priority", priority);
      const r = await fetch(`/api/prospects?${params.toString()}`, { cache: "no-store" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No fue posible cargar los prospectos.");
      setProspects(Array.isArray(data) ? data : []);
    } catch (e) {
      setProspects([]);
      setError(e instanceof Error ? e.message : "No fue posible cargar los prospectos.");
    }
  }

  useEffect(() => { load(); }, [status, dataset, priority]);

  const metrics = useMemo(() => ({
    total: prospects.length,
    pending: prospects.filter(p => p.status === "PENDING").length,
    contacted: prospects.filter(p => ["CONTACTED","RESPONDED"].includes(p.status)).length,
    interested: prospects.filter(p => ["INTERESTED","QUOTED"].includes(p.status)).length,
    won: prospects.filter(p => p.status === "WON").length,
    incomplete: prospects.filter(p => ((!p.phone && !p.whatsapp) || !p.website || !p.email)).length,
  }), [prospects]);

  async function selectProspect(p: Prospect) {
    setGenerated("");
    setCopied(false);
    setInteractionSummary("");
    try {
      const r = await fetch(`/api/prospects/${p.id}`, { cache: "no-store" });
      const detail = await r.json();
      setSelected(r.ok ? detail : p);
    } catch {
      setSelected(p);
    }
  }

  async function updateProspect(p: Prospect, patch: Partial<Prospect>) {
    const r = await fetch(`/api/prospects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated = await r.json();
    if (!r.ok) throw new Error(updated?.error || "No se pudo guardar el prospecto");
    setProspects(items => items.map(x => x.id === p.id ? {...x,...updated} : x));
    if (selected?.id === p.id) setSelected({...selected,...updated});
    return updated as Prospect;
  }

  async function addInteraction() {
    if (!selected || !interactionSummary.trim()) return;
    const r = await fetch(`/api/prospects/${selected.id}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: interactionChannel, summary: interactionSummary }),
    });
    const data = await r.json();
    if (!r.ok) return alert(data?.error || "No se pudo registrar el contacto");
    setSelected({...selected, lastContactAt: new Date().toISOString(), interactions: [data, ...(selected.interactions || [])]});
    setInteractionSummary("");
  }

  async function generateMessage(p: Prospect, openWhatsApp = false) {
    const r = await fetch("/api/messages/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId: p.id, messageType }),
    });
    const data = await r.json();
    if (!r.ok) return alert(data?.error || "No se pudo generar el mensaje");
    setGenerated(data.message || "");
    setCopied(false);
    if (openWhatsApp && data.whatsappUrl) window.open(data.whatsappUrl, "_blank");
  }

  async function copyMessage() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function importFile(form: FormData) {
    setLoading(true);
    try {
      const r = await fetch("/api/import", { method: "POST", body: form });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo importar el archivo.");
      alert(`Importados: ${data.imported ?? 0}`);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo importar el archivo.");
    } finally { setLoading(false); }
  }

  const missing = selected ? [
    !selected.phone && !selected.whatsapp ? "Teléfono / WhatsApp" : null,
    !selected.email ? "Email" : null,
    !selected.website ? "Página web" : null,
    !selected.contactName ? "Contacto" : null,
    !selected.facebook && !selected.instagram ? "Redes sociales" : null,
  ].filter(Boolean) : [];

  return (
    <main className="page">
      <header className="header">
        <div><h1>PROSPECT2</h1><p>CRM de prospección y seguimiento comercial.</p></div>
        <form action={importFile} className="importer">
          <input name="file" type="file" accept=".xlsx,.xls,.csv" required />
          <select name="dataset" defaultValue="Pequeñas empresas"><option>Pequeñas empresas</option><option>Medianas empresas</option></select>
          <button disabled={loading}>{loading ? "Importando..." : "Importar Excel"}</button>
        </form>
      </header>

      {error && <div className="errorBox">{error}</div>}

      <section className="metrics six">
        <Card label="Prospectos" value={metrics.total} />
        <Card label="Pendientes" value={metrics.pending} />
        <Card label="Contactados" value={metrics.contacted} />
        <Card label="Interesados" value={metrics.interested} />
        <Card label="Ganados" value={metrics.won} />
        <Card label="Con datos faltantes" value={metrics.incomplete} />
      </section>

      <section className="toolbar">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar negocio, giro, teléfono..." onKeyDown={e => e.key === "Enter" && load()} />
        <select value={dataset} onChange={e => setDataset(e.target.value)}><option value="">Todos los tamaños</option><option>Pequeñas empresas</option><option>Medianas empresas</option></select>
        <select value={priority} onChange={e => setPriority(e.target.value)}><option value="">Todas las prioridades</option><option value="A">Prioridad A</option><option value="B">Prioridad B</option><option value="C">Prioridad C</option></select>
        <select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select>
        <button onClick={load}>Buscar</button>
        <div className="viewSwitch"><button className={view === "LIST" ? "active" : ""} onClick={() => setView("LIST")}>Lista</button><button className={view === "KANBAN" ? "active" : ""} onClick={() => setView("KANBAN")}>Kanban</button></div>
      </section>

      <section className={view === "LIST" ? "layout" : "layout kanbanLayout"}>
        <div>{view === "LIST" ? <ProspectTable prospects={prospects} selected={selected} onSelect={selectProspect} /> : <Kanban prospects={prospects} onSelect={selectProspect} onStatus={async (p,s) => { await updateProspect(p,{status:s}); }} />}</div>

        <aside className="panel">
          {!selected ? <div className="emptyPanel"><strong>Selecciona un prospecto</strong><p>Aquí podrás completar datos, preparar mensajes y dar seguimiento.</p></div> : <>
            <div className="panelTitle"><div><h2>{selected.name}</h2><span className={`badge priority ${selected.priority}`}>Prioridad {selected.priority} · {selected.score}</span></div><span className="datasetBadge">{selected.businessType || selected.size}</span></div>

            {missing.length > 0 && <div className="missingBox"><strong>Falta completar</strong><div>{missing.map(x => <span key={String(x)}>{x}</span>)}</div></div>}

            <div className="formGrid">
              <Field label="Contacto" value={selected.contactName} onChange={v => setSelected({...selected,contactName:v})} onBlur={() => updateProspect(selected,{contactName:selected.contactName})} />
              <Field label="Teléfono" value={selected.phone} onChange={v => setSelected({...selected,phone:v})} onBlur={() => updateProspect(selected,{phone:selected.phone})} />
              <Field label="WhatsApp" value={selected.whatsapp} onChange={v => setSelected({...selected,whatsapp:v})} onBlur={() => updateProspect(selected,{whatsapp:selected.whatsapp})} />
              <Field label="Email" value={selected.email} onChange={v => setSelected({...selected,email:v})} onBlur={() => updateProspect(selected,{email:selected.email})} />
              <Field label="Web" value={selected.website} onChange={v => setSelected({...selected,website:v})} onBlur={() => updateProspect(selected,{website:selected.website})} />
              <Field label="Facebook" value={selected.facebook} onChange={v => setSelected({...selected,facebook:v})} onBlur={() => updateProspect(selected,{facebook:selected.facebook})} />
              <Field label="Instagram" value={selected.instagram} onChange={v => setSelected({...selected,instagram:v})} onBlur={() => updateProspect(selected,{instagram:selected.instagram})} />
              <Field label="Precio sugerido" value={selected.suggestedPrice} onChange={v => setSelected({...selected,suggestedPrice:v})} onBlur={() => updateProspect(selected,{suggestedPrice:selected.suggestedPrice})} />
            </div>

            <label>Servicio / oferta<input value={selected.suggestedOffer || ""} onChange={e => setSelected({...selected,suggestedOffer:e.target.value})} onBlur={() => updateProspect(selected,{suggestedOffer:selected.suggestedOffer})} /></label>
            <label>Problema detectado / argumento<textarea value={selected.salesArgument || ""} onChange={e => setSelected({...selected,salesArgument:e.target.value})} onBlur={() => updateProspect(selected,{salesArgument:selected.salesArgument})} rows={3} /></label>
            <label>Notas<textarea value={selected.notes || ""} onChange={e => setSelected({...selected,notes:e.target.value})} onBlur={() => updateProspect(selected,{notes:selected.notes})} rows={3} /></label>

            <div className="formGrid">
              <label>Estado<select value={selected.status} onChange={e => updateProspect(selected,{status:e.target.value})}>{statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></label>
              <label>Próximo seguimiento<input type="datetime-local" value={selected.nextFollowUpAt ? selected.nextFollowUpAt.slice(0,16) : ""} onChange={e => setSelected({...selected,nextFollowUpAt:e.target.value ? new Date(e.target.value).toISOString() : null})} onBlur={() => updateProspect(selected,{nextFollowUpAt:selected.nextFollowUpAt})} /></label>
            </div>

            <div className="messageBuilder">
              <div className="messageHeader"><strong>Mensaje comercial</strong><select value={messageType} onChange={e => setMessageType(e.target.value as MessageType)}>{Object.entries(messageLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="messageActions"><button onClick={() => generateMessage(selected,false)}>Generar</button><button onClick={() => generateMessage(selected,true)}>Abrir WhatsApp</button><button className="secondary" disabled={!generated} onClick={copyMessage}>{copied ? "Copiado ✓" : "Copiar"}</button></div>
              {generated && <textarea className="message" value={generated} onChange={e => setGenerated(e.target.value)} rows={8} />}
            </div>

            <div className="historyBox">
              <div className="historyTitle"><strong>Historial de contacto</strong>{selected.lastContactAt && <small>Último: {new Date(selected.lastContactAt).toLocaleString("es-MX")}</small>}</div>
              <div className="interactionForm"><select value={interactionChannel} onChange={e => setInteractionChannel(e.target.value)}><option>WHATSAPP</option><option>PHONE</option><option>EMAIL</option><option>FACEBOOK</option><option>INSTAGRAM</option><option>LINKEDIN</option><option>OTHER</option></select><input value={interactionSummary} onChange={e => setInteractionSummary(e.target.value)} placeholder="Ej. Respondió, pide información el viernes..."/><button onClick={addInteraction}>Registrar</button></div>
              <div className="historyList">{(selected.interactions || []).length === 0 ? <p className="muted">Aún no hay contactos registrados.</p> : (selected.interactions || []).map(i => <div className="historyItem" key={i.id}><div><strong>{i.channel}</strong><span>{new Date(i.happenedAt).toLocaleString("es-MX")}</span></div><p>{i.summary}</p></div>)}</div>
            </div>
          </>}
        </aside>
      </section>
    </main>
  );
}

function ProspectTable({prospects,selected,onSelect}:{prospects:Prospect[],selected:Prospect|null,onSelect:(p:Prospect)=>void}) {
  return <div className="tableWrap"><table><thead><tr><th>Negocio</th><th>Base</th><th>Teléfono</th><th>Oferta</th><th>Prioridad</th><th>Estado</th><th>Seguimiento</th></tr></thead><tbody>{prospects.map(p => <tr key={p.id} onClick={() => onSelect(p)} className={selected?.id === p.id ? "active" : ""}><td><strong>{p.name}</strong><small>{p.segment || "Sin giro"}</small></td><td>{p.businessType || p.employeeRange || p.size}</td><td>{p.whatsapp || p.phone || <span className="missingText">Pendiente</span>}</td><td>{p.suggestedOffer || "Definir"}</td><td><span className={`badge priority ${p.priority}`}>{p.priority} · {p.score}</span></td><td><span className={`badge status ${p.status}`}>{labels[p.status]}</span></td><td>{p.nextFollowUpAt ? new Date(p.nextFollowUpAt).toLocaleDateString("es-MX") : "—"}</td></tr>)}</tbody></table></div>
}

function Kanban({prospects,onSelect,onStatus}:{prospects:Prospect[],onSelect:(p:Prospect)=>void,onStatus:(p:Prospect,s:string)=>void}) {
  return <div className="kanban">{activeKanban.map(s => <div className="kanbanCol" key={s}><div className="kanbanHead"><strong>{labels[s]}</strong><span>{prospects.filter(p => p.status === s).length}</span></div><div className="kanbanCards">{prospects.filter(p => p.status === s).map(p => <div className="kanbanCard" key={p.id} onClick={() => onSelect(p)}><div className="kanbanCardTop"><strong>{p.name}</strong><span className={`badge priority ${p.priority}`}>{p.priority}</span></div><small>{p.segment || p.businessType}</small><div className="kanbanMeta"><span>{p.phone || p.whatsapp ? "📞 Contactable" : "⚠ Sin teléfono"}</span><span>{p.suggestedOffer || "Oferta por definir"}</span></div><select value={p.status} onClick={e => e.stopPropagation()} onChange={e => onStatus(p,e.target.value)}>{activeKanban.map(x => <option key={x} value={x}>{labels[x]}</option>)}</select></div>)}</div></div>)}</div>
}

function Field({label,value,onChange,onBlur}:{label:string,value?:string|null,onChange:(v:string)=>void,onBlur:()=>void}) { return <label>{label}<input value={value || ""} onChange={e => onChange(e.target.value)} onBlur={onBlur} /></label>; }
function Card({label,value}:{label:string,value:number}) { return <div className="card"><span>{label}</span><strong>{value}</strong></div>; }
