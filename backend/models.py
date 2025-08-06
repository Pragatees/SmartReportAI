from pydantic import BaseModel, Field
from typing import List, Dict, Any

class TextInput(BaseModel):
    text: str
    language: str = "English"

class InsightInput(BaseModel):
    domain: str
    content: str
    language: str = "English"

class SuggestionInput(BaseModel):
    insights: List[Dict[str, Any]] = Field(..., description="List of insight objects from the frontend")

class VectorStoreInput(BaseModel):
    text: str
    domain_result: Dict[str, Any] = None
    insights_result: Dict[str, Any] = None
    suggestions: List[str] = []

class QueryInput(BaseModel):
    query: str
    k: int = 5
    distance_threshold: float = 2.0