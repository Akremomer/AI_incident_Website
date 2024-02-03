from typing import Any, Dict


class AIEngine:
    async def analyze(self, title: str, description: str) -> Dict[str, Any]:
        return {
            "summary": f"Initial analysis for {title}",
            "category": "Infrastructure",
            "severity_score": 7,
            "probable_cause": "Resource contention in the primary service path",
            "recommended_action": "Inspect load balancer metrics and scale the affected service",
            "explanation": description,
        }
