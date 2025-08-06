import json
import logging
import requests
from fastapi import APIRouter, HTTPException
from models import TextInput

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/identify-domain", tags=["Domain Identification"])

# Replace with your actual Perplexity API key
PERPLEXITY_API_KEY = "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"
HEADERS = {
    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
    "Content-Type": "application/json"
}
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

@router.post("/")
async def identify_domain(input: TextInput):
    if not input.text.strip():
        logger.warning("Empty text received")
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    prompt = f"""
You are an expert domain classifier. Carefully read the provided text and classify it into one of the following broad domains:

- Healthcare
- Finance
- Education
- Legal
- Resume/Career
- Technology
- Government
- General Knowledge
- Others

Important:
- Resumes with technical skills or project mentions → "Resume/Career"
- Avoid generic categories unless unclear.

Respond ONLY with a valid JSON object in this format:
{{
  "domain": "...",
  "confidence": ...,
  "reason": "..."
}}

Text:
{input.text[:10000]}
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
        logger.debug(f"Perplexity API response: {response_json}")

        message_content = response_json.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not message_content:
            raise HTTPException(status_code=500, detail="Empty response from Perplexity API")

        result = json.loads(message_content)
        if not all(key in result for key in ['domain', 'confidence', 'reason']):
            raise HTTPException(status_code=500, detail="Missing required fields in response")

        return result

    except json.JSONDecodeError:
        logger.error(f"Invalid JSON response: {message_content}")
        raise HTTPException(status_code=500, detail="Invalid JSON format returned by Perplexity API")
    except Exception as e:
        logger.error(f"Error in identify_domain: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to identify domain: {str(e)}")