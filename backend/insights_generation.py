import json
import logging
import requests
from fastapi import APIRouter, HTTPException
from models import InsightInput

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate-insights", tags=["Insights Generation"])

PERPLEXITY_API_KEY = "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"  # ⚠️ MOVE TO ENV in production
HEADERS = {
    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
    "Content-Type": "application/json"
}
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

@router.post("/")
async def generate_insights(input: InsightInput):
    if not input.content.strip() or not input.domain.strip():
        logger.warning("Empty content or domain received")
        raise HTTPException(status_code=400, detail="Content and domain cannot be empty")

    prompt = f"""
You are a highly skilled and domain-aware AI Insight Agent. Analyze the document below based on its **domain** and **full content**. Your goal is to extract deep, meaningful insights, present a domain-aware summary, and highlight potential **risk factors** based on the document content and its context.

Respond ONLY with a valid JSON object in the following exact format:

{{
  "detailed_insights": [
    {{
      "title": "Insight Title 1",
      "description": "Detailed explanation with reasoning based on the content.",
      "supporting_data": ["fact1", "value2", "related reference from content"],
      "risk_factors": ["Risk 1", "Risk 2"]
    }},
    {{
      "title": "Insight Title 2",
      "description": "...",
      "supporting_data": ["..."],
      "risk_factors": ["..."]
    }}
  ],
  "domain_summary": "A deep summary explaining what the document contains, its purpose, and major findings or concerns."
}}

⚠️ STRICT INSTRUCTIONS:
- DO NOT include any text before or after the JSON.
- DO NOT explain the output.
- Use only real data from the content — no hallucination or assumptions.
- Risk factors must be based on the domain and content.
- The response must be **valid, well-formatted JSON** and include all required fields.

Domain-specific risk considerations:
- For legal documents: highlight contractual, regulatory, or compliance-related risks.
- For medical documents: highlight patient health, treatment, and procedural risks.
- For financial reports: highlight economic, fraud, or operational risks.
- For education: highlight learning, policy, or access-related risks.
- For other domains: use logical domain-aware risk interpretations.

Domain: {input.domain}
Language: {input.language}

Content:
{input.content[:10000]}
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

        json_start = message_content.find('{')
        json_end = message_content.rfind('}') + 1
        pure_json = message_content[json_start:json_end]

        result = json.loads(pure_json)

        if "detailed_insights" not in result or "domain_summary" not in result:
            raise HTTPException(status_code=500, detail="Missing required fields in response")
        if not isinstance(result["detailed_insights"], list):
            raise HTTPException(status_code=500, detail="detailed_insights must be a list")

        # Validate risk_factors field in each insight
        for insight in result["detailed_insights"]:
            if "risk_factors" not in insight:
                raise HTTPException(status_code=500, detail="Missing risk_factors in insights")

        return result

    except json.JSONDecodeError as je:
        logger.error(f"Invalid JSON response: {message_content}")
        logger.error(f"JSON decode error: {str(je)}")
        raise HTTPException(status_code=422, detail={
            "message": "The model returned an invalid response format",
            "original_response": message_content,
            "error": str(je)
        })

    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
