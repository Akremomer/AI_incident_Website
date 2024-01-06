const stats = [
  { label: 'Active incidents', value: '12' },
  { label: 'High priority', value: '03' },
  { label: 'Responders online', value: '07' },
];

export default function App() {
  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="eyebrow">Incident Atlas</p>
          <h1>Command view for production alerts</h1>
          <p className="copy">
            Building the initial dashboard layout for triage, active incidents, and summary metrics.
          </p>
        </div>
        <button className="primary-button">Report incident</button>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="card">
            <p className="card-label">{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="table-shell">
        <div className="table-header">
          <div>
            <p className="eyebrow">Queue</p>
            <h2>Incidents</h2>
          </div>
          <span className="chip">Draft layout</span>
        </div>
        <div className="row">
          <span>Database latency spike</span>
          <span>High</span>
          <span>Investigating</span>
        </div>
        <div className="row">
          <span>Cache miss storm</span>
          <span>Medium</span>
          <span>Open</span>
        </div>
      </section>
    </main>
  );
}
