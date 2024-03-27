import React, { useDeferredValue, useEffect, useState, startTransition } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  Database,
  LayoutDashboard,
  Plus,
  Radar,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
  Waves,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  createdAt: string;
  analysis?: {
    summary: string;
    probableCause: string;
    recommendedAction: string;
    severityScore: number;
  };
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Radar, label: 'Signals' },
  { icon: BrainCircuit, label: 'AI Briefings' },
  { icon: TerminalSquare, label: 'Runbooks' },
  { icon: Database, label: 'Data Stores' },
  { icon: Cpu, label: 'Compute' },
  { icon: Settings, label: 'Control' },
];

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', description: '', severity: 'Medium' });
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      startTransition(() => {
        setIncidents(data);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewIncident({ title: '', description: '', severity: 'Medium' });
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await fetch(`/api/incidents/${id}/analyze`, { method: 'POST' });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSeverity =
      severityFilter === 'All' || incident.severity.toLowerCase() === severityFilter.toLowerCase();
    const needle = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      needle === '' ||
      incident.title.toLowerCase().includes(needle) ||
      incident.description.toLowerCase().includes(needle) ||
      incident.category.toLowerCase().includes(needle) ||
      incident.id.toLowerCase().includes(needle);

    return matchesSeverity && matchesSearch;
  });

  const criticalCount = incidents.filter((incident) => incident.severity.toLowerCase() === 'critical').length;
  const analyzedCount = incidents.filter((incident) => incident.analysis).length;
  const avgSeverity =
    incidents.length > 0
      ? Math.round(
          incidents.reduce((sum, incident) => sum + (incident.analysis?.severityScore ?? 6), 0) / incidents.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[var(--accent)]/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-12rem] h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(248,177,74,0.18),_transparent_55%)]" />
        <div className="absolute right-[-12rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-[rgba(55,180,171,0.15)] blur-3xl" />
        <div className="absolute left-[-8rem] bottom-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[rgba(255,107,53,0.12)] blur-3xl" />
        <div className="hud-grid absolute inset-0 opacity-30" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[290px] shrink-0 border-r border-white/8 bg-[rgba(7,11,16,0.72)] px-6 py-7 backdrop-blur xl:flex xl:flex-col">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(248,177,74,0.95),rgba(255,107,53,0.82))] text-[var(--ink-strong)] shadow-[0_18px_38px_rgba(255,107,53,0.28)]">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Command Grid</p>
                <h1 className="font-display text-xl font-semibold text-white">Incident Atlas</h1>
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(248,177,74,0.18)] bg-[linear-gradient(180deg,rgba(248,177,74,0.12),rgba(255,255,255,0.02))] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Watch Status</span>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Stable</span>
              </div>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Live operational cockpit for triage, escalation, and AI-guided response.
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ icon: Icon, label, active }) => (
              <NavItem key={label} icon={<Icon className="h-4 w-4" />} label={label} active={active} />
            ))}
          </nav>

          <div className="mt-auto rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Threat Surface</span>
              <Waves className="h-4 w-4 text-[var(--accent-cool)]" />
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/6">
              <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,var(--accent-cool),var(--accent))]" />
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              East cluster and auth traffic remain the dominant noise sources in the current incident mix.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(140deg,rgba(11,16,22,0.92),rgba(8,11,16,0.85))] shadow-[0_30px_120px_rgba(0,0,0,0.42)]"
          >
            <div className="grid gap-8 border-b border-white/8 px-6 py-8 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:px-8">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[rgba(248,177,74,0.24)] bg-[rgba(248,177,74,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Ops Theater</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Nairobi Shift</span>
                </div>

                <div className="max-w-3xl">
                  <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                    See pressure build, isolate failure fast, and brief responders with clarity.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                    A cleaner incident command view with stronger hierarchy, live filtering, and richer AI insight panels.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search incident, service, region, or ID"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition focus:border-[var(--accent)]/50 focus:bg-white/[0.06]"
                    />
                  </div>

                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/50"
                  >
                    <option>All</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 text-sm font-semibold text-[var(--ink-strong)] shadow-[0_18px_40px_rgba(255,107,53,0.26)] transition hover:translate-y-[-1px]"
                  >
                    <Plus className="h-4 w-4" />
                    Report Incident
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <SignalCard label="Priority Window" value="08m" detail="Median time before impact broadens" icon={<Clock3 className="h-4 w-4" />} />
                <SignalCard label="AI Briefings" value={String(analyzedCount)} detail="Incidents with generated recommendations" icon={<Sparkles className="h-4 w-4" />} />
                <SignalCard label="Escalation Bias" value={`${avgSeverity}/10`} detail="Average pressure score across the board" icon={<AlertTriangle className="h-4 w-4" />} />
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 lg:px-8">
              <StatCard label="Total Incidents" value={incidents.length} trend="+12%" tone="warm" />
              <StatCard label="Critical Alerts" value={criticalCount} trend="-5%" tone="danger" />
              <StatCard label="AI Insights" value={analyzedCount} trend="+24%" tone="cool" />
              <StatCard label="Filtered View" value={filteredIncidents.length} trend="LIVE" tone="neutral" />
            </div>
          </motion.section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,11,16,0.78)] shadow-[0_18px_70px_rgba(0,0,0,0.34)] backdrop-blur"
            >
              <div className="flex flex-col gap-3 border-b border-white/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Live Queue</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Active Incident Feed</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                  Showing {filteredIncidents.length} of {incidents.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      <th className="px-6 py-4 font-medium">Incident</th>
                      <th className="px-6 py-4 font-medium">Severity</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Created</th>
                      <th className="px-6 py-4 text-right font-medium">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">Pulling incidents from the watch grid...</td></tr>
                    ) : filteredIncidents.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">No incidents match the current search or severity filter.</td></tr>
                    ) : (
                      filteredIncidents.map((incident, index) => (
                        <IncidentRow key={incident.id} incident={incident} index={index} onAnalyze={() => handleAnalyze(incident.id)} isAnalyzing={analyzingId === incident.id} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>

            <motion.aside initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }} className="space-y-6">
              <Panel>
                <PanelHeader eyebrow="Pulse" title="Operations Snapshot" />
                <div className="space-y-4">
                  <QuickMetric label="Infrastructure" value="42%" accent="warm" />
                  <QuickMetric label="Application" value="31%" accent="cool" />
                  <QuickMetric label="Security" value="09%" accent="danger" />
                  <QuickMetric label="Investigating" value={`${incidents.filter((i) => i.status === 'Investigating').length}`} accent="neutral" />
                </div>
              </Panel>

              <Panel>
                <PanelHeader eyebrow="Advisor" title="Response Notes" />
                <div className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  <InsightCard icon={<Sparkles className="h-4 w-4" />} title="Bias toward action" body="Lead with the highest-severity incident, then reduce queue noise by closing informational alerts quickly." />
                  <InsightCard icon={<Activity className="h-4 w-4" />} title="Operational pressure" body="Traffic-linked incidents remain dominant. Watch auth and data-store dependencies first." />
                </div>
              </Panel>

              <Panel>
                <PanelHeader eyebrow="Coverage" title="Recent Focus" />
                <div className="grid gap-3">
                  {incidents.slice(0, 3).map((incident) => (
                    <div key={incident.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{incident.category}</p>
                      <p className="mt-2 text-sm font-medium text-white">{incident.title}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.aside>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[rgba(1,4,8,0.78)] backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.28 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(9,14,20,0.96),rgba(12,19,26,0.92))] shadow-[0_28px_100px_rgba(0,0,0,0.45)]"
            >
              <form onSubmit={handleCreate}>
                <div className="border-b border-white/8 px-6 py-6 sm:px-8">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">New Brief</p>
                  <h3 className="mt-2 font-display text-3xl text-white">Report an Incident</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                    Capture the signal clearly. The cleaner the report, the sharper the triage and AI recommendation.
                  </p>
                </div>

                <div className="grid gap-5 px-6 py-6 sm:px-8">
                  <Field label="Incident Title">
                    <input required value={newIncident.title} onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })} placeholder="API gateway latency spike in eu-west" className="field-input" />
                  </Field>

                  <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                    <Field label="Severity">
                      <select value={newIncident.severity} onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })} className="field-input">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </Field>

                    <div className="rounded-2xl border border-[rgba(55,180,171,0.18)] bg-[rgba(55,180,171,0.08)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                      Include the affected service, user impact, and any log evidence or metrics that support the alert.
                    </div>
                  </div>

                  <Field label="Description & Logs">
                    <textarea required value={newIncident.description} onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })} rows={6} placeholder="Describe symptoms, affected services, timelines, and paste the strongest log clues..." className="field-input resize-none" />
                  </Field>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/8 bg-black/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.04] hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 text-sm font-semibold text-[var(--ink-strong)] shadow-[0_18px_40px_rgba(255,107,53,0.24)]">
                    <ArrowUpRight className="h-4 w-4" />
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
        active
          ? 'border-[rgba(248,177,74,0.24)] bg-[rgba(248,177,74,0.12)] text-white shadow-[0_12px_30px_rgba(248,177,74,0.08)]'
          : 'border-transparent text-[var(--text-secondary)] hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
      }`}
    >
      <span className={`${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function SignalCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-4 flex items-center justify-between text-[var(--text-muted)]">
        <span className="text-[11px] uppercase tracking-[0.22em]">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  tone,
}: {
  label: string;
  value: string | number;
  trend: string;
  tone: 'warm' | 'danger' | 'cool' | 'neutral';
}) {
  const toneClasses = {
    warm: 'from-[rgba(248,177,74,0.16)] to-transparent text-[var(--accent)]',
    danger: 'from-[rgba(255,96,91,0.14)] to-transparent text-[var(--danger)]',
    cool: 'from-[rgba(55,180,171,0.16)] to-transparent text-[var(--accent-cool)]',
    neutral: 'from-white/8 to-transparent text-white',
  }[tone];

  return (
    <div className={`rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,${toneClasses})] p-5`}>
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="text-3xl font-semibold text-white">{value}</div>
        <div className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[var(--text-secondary)]">
          {trend}
        </div>
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(8,11,16,0.78)] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
      {children}
    </section>
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{eyebrow}</p>
      <h4 className="mt-1 font-display text-2xl text-white">{title}</h4>
    </div>
  );
}

function QuickMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'warm' | 'cool' | 'danger' | 'neutral';
}) {
  const barColor = {
    warm: 'from-[var(--accent)] to-[var(--accent-strong)]',
    cool: 'from-[var(--accent-cool)] to-[#8ee4d1]',
    danger: 'from-[var(--danger)] to-[#ff9d9a]',
    neutral: 'from-white/70 to-white/20',
  }[accent];

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full bg-gradient-to-r ${barColor}`} style={{ width: value }} />
      </div>
    </div>
  );
}

function InsightCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-white">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function IncidentRow({
  incident,
  index,
  onAnalyze,
  isAnalyzing,
}: {
  incident: Incident;
  index: number;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const severityStyles = getSeverityStyles(incident.severity);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`group cursor-pointer transition ${expanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[var(--accent)]">{incident.id}</span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{incident.category}</span>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="max-w-[360px] text-sm font-medium leading-6 text-white">{incident.title}</div>
        </td>
        <td className="px-6 py-5">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${severityStyles}`}>
            {incident.severity}
          </span>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {getStatusIcon(incident.status)}
            <span>{incident.status}</span>
          </div>
        </td>
        <td className="px-6 py-5 text-sm text-[var(--text-secondary)]">
          <div>{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-xs text-[var(--text-muted)]">{new Date(incident.createdAt).toLocaleDateString()}</div>
        </td>
        <td className="px-6 py-5 text-right">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--text-secondary)] transition group-hover:text-white">
            <ChevronRight className={`h-4 w-4 transition ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </td>
      </motion.tr>

      <AnimatePresence initial={false}>
        {expanded && (
          <tr>
            <td colSpan={5} className="bg-[rgba(0,0,0,0.12)] px-6 py-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
                  <div className="space-y-5">
                    <DetailCard title="Incident Description">
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">{incident.description}</p>
                    </DetailCard>

                    {incident.analysis ? (
                      <div className="grid gap-5 lg:grid-cols-2">
                        <DetailCard title="AI Summary" icon={<BrainCircuit className="h-4 w-4 text-[var(--accent)]" />}>
                          <p className="text-sm leading-7 text-[var(--text-secondary)]">{incident.analysis.summary}</p>
                        </DetailCard>
                        <DetailCard title="Probable Cause" icon={<AlertTriangle className="h-4 w-4 text-[var(--danger)]" />}>
                          <p className="text-sm leading-7 text-[var(--text-secondary)]">{incident.analysis.probableCause}</p>
                        </DetailCard>
                      </div>
                    ) : null}

                    {incident.analysis ? (
                      <div className="rounded-[24px] border border-[rgba(248,177,74,0.18)] bg-[linear-gradient(140deg,rgba(248,177,74,0.12),rgba(255,255,255,0.03))] p-5">
                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                          <Sparkles className="h-4 w-4" />
                          Recommended Action
                        </div>
                        <p className="text-sm font-medium leading-7 text-white">{incident.analysis.recommendedAction}</p>
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-6 text-center">
                        <BrainCircuit className={`mx-auto mb-3 h-9 w-9 ${isAnalyzing ? 'animate-pulse text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                        <p className="mx-auto max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                          {isAnalyzing
                            ? 'AI is reviewing the incident payload now.'
                            : 'This incident does not have an AI briefing yet.'}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnalyze();
                          }}
                          disabled={isAnalyzing}
                          className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-60"
                        >
                          {isAnalyzing ? 'Analyzing...' : 'Trigger AI Analysis'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <DetailCard title="Metadata">
                      <div className="space-y-4">
                        <MetaItem label="Reporter" value="System Monitor" />
                        <MetaItem label="Service" value="auth-api-v2" />
                        <MetaItem label="Cluster" value="prod-us-east-1" />
                        <MetaItem label="Region" value="us-east-1" />
                      </div>
                    </DetailCard>

                    {incident.analysis ? (
                      <div className="rounded-[24px] border border-[rgba(55,180,171,0.18)] bg-[linear-gradient(160deg,rgba(55,180,171,0.14),rgba(255,255,255,0.03))] p-5">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">AI Severity Score</div>
                        <div className="mt-3 flex items-center gap-4">
                          <div className="text-4xl font-semibold text-white">{incident.analysis.severityScore}</div>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cool),var(--accent))]"
                              style={{ width: `${incident.analysis.severityScore * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'resolved':
      return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
    case 'investigating':
      return <Activity className="h-4 w-4 animate-pulse text-[var(--accent)]" />;
    case 'analyzed':
      return <BrainCircuit className="h-4 w-4 text-[var(--accent-cool)]" />;
    default:
      return <Clock3 className="h-4 w-4 text-[var(--text-muted)]" />;
  }
}

function getSeverityStyles(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'border-[rgba(255,96,91,0.28)] bg-[rgba(255,96,91,0.12)] text-[var(--danger)]';
    case 'high':
      return 'border-[rgba(255,154,60,0.28)] bg-[rgba(255,154,60,0.12)] text-[#ffbf7c]';
    case 'medium':
      return 'border-[rgba(248,177,74,0.28)] bg-[rgba(248,177,74,0.12)] text-[var(--accent)]';
    default:
      return 'border-[rgba(55,180,171,0.28)] bg-[rgba(55,180,171,0.12)] text-[var(--accent-cool)]';
  }
}
