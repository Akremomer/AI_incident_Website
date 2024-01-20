import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const port = 3000;

  let incidents = [
    {
      id: "INC-2024-001",
      title: "Database latency spike",
      description: "Sustained query latency across the primary cluster.",
      severity: "High",
      status: "Investigating",
      category: "Database",
      createdAt: new Date().toISOString(),
      analysis: null,
    },
  ];

  app.use(express.json());

  app.get("/api/incidents", (_req, res) => {
    res.json(incidents);
  });

  app.post("/api/incidents", (req, res) => {
    const incident = {
      id: `INC-2024-${String(incidents.length + 1).padStart(3, "0")}`,
      title: req.body.title,
      description: req.body.description,
      severity: req.body.severity || "Medium",
      status: "Open",
      category: "Triage",
      createdAt: new Date().toISOString(),
      analysis: null,
    };

    incidents = [incident, ...incidents];
    res.status(201).json(incident);
  });

  app.post("/api/incidents/:id/analyze", (req, res) => {
    const incident = incidents.find((entry) => entry.id === req.params.id);

    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    incident.status = "Analyzed";
    incident.analysis = {
      summary: `Investigating ${incident.title}`,
      probableCause: "Temporary resource contention in the primary service path.",
      recommendedAction: "Increase capacity and validate recent deploy changes.",
      severityScore: incident.severity === "High" ? 8 : 6,
    };

    res.json(incident);
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
