import { FormEvent, useEffect, useState } from 'react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  createdAt: string;
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', description: '', severity: 'Medium' });

  const loadIncidents = async () => {
    const response = await fetch('/api/incidents');
    const data = await response.json();
    setIncidents(data);
  };

  useEffect(() => {
    loadIncidents().catch((error) => console.error(error));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setDraft({ title: '', description: '', severity: 'Medium' });
    setShowForm(false);
    loadIncidents().catch((error) => console.error(error));
  };

  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="eyebrow">Incident Atlas</p>
          <h1>Command view for production alerts</h1>
          <p className="copy">Adding incident detail expansion so responders can inspect context inline.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm(true)}>
          Report incident
        </button>
      </section>

      <section className="stats-grid">
        <article className="card">
          <p className="card-label">Active incidents</p>
          <strong>{incidents.length}</strong>
        </article>
        <article className="card">
          <p className="card-label">High priority</p>
          <strong>{incidents.filter((incident) => incident.severity === 'High').length}</strong>
        </article>
        <article className="card">
          <p className="card-label">Investigating</p>
          <strong>{incidents.filter((incident) => incident.status === 'Investigating').length}</strong>
        </article>
      </section>

      <section className="table-shell">
        <div className="table-header">
          <div>
            <p className="eyebrow">Queue</p>
            <h2>Incidents</h2>
          </div>
          <span className="chip">{incidents.length} records</span>
        </div>

        {incidents.map((incident) => (
          <div key={incident.id} className="incident-block">
            <button className="row row-button" onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}>
              <div>
                <strong>{incident.title}</strong>
                <p className="row-copy">{incident.description}</p>
              </div>
              <span>{incident.severity}</span>
              <span>{incident.status}</span>
            </button>

            {expandedId === incident.id ? (
              <div className="detail-card">
                <p className="eyebrow">Incident detail</p>
                <p className="detail-copy">{incident.description}</p>
                <div className="detail-meta">
                  <span>{incident.id}</span>
                  <span>{incident.category}</span>
                  <span>{new Date(incident.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {showForm ? (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <p className="eyebrow">New incident</p>
            <h2>Report issue</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Incident title" />
              <select value={draft.severity} onChange={(event) => setDraft({ ...draft, severity: event.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <textarea required rows={5} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Describe the impact and symptoms" />
              <button className="primary-button" type="submit">
                Save incident
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
