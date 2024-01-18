import { useEffect, useState } from 'react';

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

  useEffect(() => {
    fetch('/api/incidents')
      .then((response) => response.json())
      .then((data) => setIncidents(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="eyebrow">Incident Atlas</p>
          <h1>Command view for production alerts</h1>
          <p className="copy">
            Pulling incident summaries from the local API and wiring up the first live dashboard view.
          </p>
        </div>
        <button className="primary-button">Report incident</button>
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
          <p className="card-label">Categories</p>
          <strong>{new Set(incidents.map((incident) => incident.category)).size}</strong>
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
          <div key={incident.id} className="row">
            <div>
              <strong>{incident.title}</strong>
              <p className="row-copy">{incident.description}</p>
            </div>
            <span>{incident.severity}</span>
            <span>{incident.status}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
