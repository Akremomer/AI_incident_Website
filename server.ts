import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini for the AI analysis part of the platform
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Mock Database for the preview
  let incidents = [
    {
      id: "INC-2026-001",
      title: "Database connection pool exhaustion in production",
      description: "Service 'auth-api' is reporting 500 errors. Logs show 'connection pool exhausted'. Traffic spike observed in the last 10 minutes.",
      severity: "Critical",
      status: "Investigating",
      category: "Infrastructure",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      analysis: {
        summary: "Production auth-api service is failing due to DB connection limits being reached during a traffic surge.",
        probableCause: "Connection pool size (currently 20) is insufficient for peak load. No auto-scaling configured for DB connections.",
        recommendedAction: "Increase max_connections in Postgres and update service config to use a larger pool. Implement circuit breaker.",
        severityScore: 9,
      }
    }
  ];

  // API Routes
  app.get("/api/incidents", (req, res) => {
    res.json(incidents);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/incidents", async (req, res) => {
    const { title, description, severity } = req.body;
    const newIncident = {
      id: `INC-${new Date().getFullYear()}-${String(incidents.length + 1).padStart(3, '0')}`,
      title,
      description,
      severity: severity || "Medium",
      status: "Open",
      category: "Triage",
      createdAt: new Date().toISOString(),
      analysis: null
    };

    incidents.unshift(newIncident);
    res.status(201).json(newIncident);
  });

  app.post("/api/incidents/:id/analyze", async (req, res) => {
    const { id } = req.params;
    const incident = incidents.find(i => i.id === id);
    
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    try {
      const prompt = `Analyze this DevOps incident and provide a structured JSON response:
      Title: ${incident.title}
      Description: ${incident.description}
      
      Return JSON with:
      - summary (string)
      - probableCause (string)
      - recommendedAction (string)
      - severityScore (number 1-10)
      - category (string: Infrastructure, Application, Network, Security, or Database)`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const analysis = JSON.parse(response.text);
      incident.analysis = analysis;
      incident.category = analysis.category;
      incident.status = "Analyzed";

      res.json(incident);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      res.status(500).json({ error: "AI Analysis failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
