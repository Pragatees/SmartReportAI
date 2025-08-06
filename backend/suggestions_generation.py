import json
import logging
import requests
from fastapi import APIRouter, HTTPException
from models import SuggestionInput

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate-suggestions", tags=["Suggestions Generation"])

PERPLEXITY_API_KEY = "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"
HEADERS = {
    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
    "Content-Type": "application/json"
}
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

@router.post("/")
async def generate_suggestions(input: SuggestionInput):
    if not input.insights or not isinstance(input.insights, list):
        logger.warning("Invalid or empty insights received for suggestions")
        raise HTTPException(status_code=400, detail="Insights must be a non-empty list")

    insights_json = json.dumps(input.insights, indent=2)

    prompt = f"""
You are a professional AI Suggestion Agent. Based on the following detailed insights extracted from a document, generate **exactly 5** clear, actionable, and prioritized recommendations that the user should follow to improve or resolve the identified issues.

Each suggestion must:
- Be directly tied to the insights.
- Focus on productivity, optimization, compliance, or issue resolution.
- Be written in plain, instructive language.
- Avoid generic suggestions.

🛑 Strictly return **only** a JSON array of 5 strings like below — no extra text or explanations:

[
  "First prioritized suggestion",
  "Second actionable suggestion",
  "Third improvement tip",
  "Fourth recommendation",
  "Fifth key advice"
]

Input Insights:
{insights_json}
"""

    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(PERPLEXITY_API_URL, headers=HEADERS, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Perplexity API error: {response.text}"
            )

        response_json = response.json()
        logger.debug(f"Perplexity API response for suggestions: {response_json}")

        message_content = response_json.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not message_content:
            raise HTTPException(status_code=500, detail="Empty response from Perplexity API")

        json_start = message_content.find('[')
        json_end = message_content.rfind(']') + 1
        suggestions_json = message_content[json_start:json_end]

        suggestions = json.loads(suggestions_json)
        if not isinstance(suggestions, list) or len(suggestions) != 5:
            raise HTTPException(status_code=500, detail="Expected a list of exactly 5 suggestions")

        return {"suggestions": suggestions}

    except json.JSONDecodeError as je:
        logger.error(f"Invalid JSON response for suggestions: {message_content}")
        logger.error(f"JSON decode error: {str(je)}")
        raise HTTPException(status_code=422, detail={
            "message": "The model returned an invalid suggestions response format",
            "original_response": message_content,
            "error": str(je)
        })

    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")