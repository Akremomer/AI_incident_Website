from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.services.ai_engine import AIEngine

app = FastAPI(title="Incident Atlas AI Service")
ai_engine = AIEngine()


class IncidentPayload(BaseModel):
    title: str
    description: str


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_incident(payload: IncidentPayload):
    try:
      return await ai_engine.analyze(payload.title, payload.description)
    except Exception as exc:
      raise HTTPException(status_code=500, detail=str(exc))
