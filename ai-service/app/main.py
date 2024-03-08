from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

from app.services.ai_engine import AIEngine

app = FastAPI(
    title="AI Incident Intelligence Service",
    version="1.0.0",
    description="Internal AI service for incident analysis.",
)
ai_engine = AIEngine()

class IncidentPayload(BaseModel):
    title: str
    description: str

class AnalysisResponse(BaseModel):
    summary: str
    category: str
    severity_score: int
    probable_cause: str
    recommended_action: str
    explanation: str

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
@app.get("/api/v1/health")
async def health_check_alias():
    return await health_check()

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_incident(payload: IncidentPayload):
    try:
        analysis = await ai_engine.analyze(payload.title, payload.description)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=AnalysisResponse)
@app.post("/api/v1/analyze", response_model=AnalysisResponse)
async def analyze_incident_alias(payload: IncidentPayload):
    return await analyze_incident(payload)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
