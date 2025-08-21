import json
import logging
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/specify-goal", tags=["Goal Specification"])

# Replace with your actual Perplexity API key
PERPLEXITY_API_KEY = "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"
HEADERS = {
    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
    "Content-Type": "application/json"
}
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

# Input model for the endpoint
class GoalInput(BaseModel):
    goal: str
    pdf_content: str

@router.post("/")
async def specify_goal(input: GoalInput):
    if not input.goal.strip():
        logger.warning("Empty goal received")
        raise HTTPException(status_code=400, detail="Goal input cannot be empty")
    if not input.pdf_content.strip():
        logger.warning("Empty PDF content received")
        raise HTTPException(status_code=400, detail="PDF content cannot be empty")

    prompt = f"""
You are an expert goal specification assistant. Your task is to analyze the provided user goal and PDF content, then generate a clear and actionable plan to achieve the goal. The response should include a structured procedure, a general approach, and specific steps tailored to the goal and context provided by the PDF content.

**Input:**
- User Goal: {input.goal}
- PDF Content: {input.pdf_content[:10000]}

**Instructions:**
AT first iniatlly check that query is not related to user document sent the false in all json 
in the format of 
{{
'Not domain matched'
}}
1. Analyze the user's goal and the PDF content to understand the context and domain.
2. Provide a concise procedure outlining the high-level plan to achieve the goal.
3. Describe a general approach that aligns with the goal and context.
4. List 3-5 specific, actionable steps to guide the user toward achieving the goal.

**Output Format:**
Return a JSON object with the following structure:
{{
  "procedure": "...",
  "approach": "...",
  "steps": ["...", "...", "...", "...", "..."]
}}

**Constraints:**
- Ensure the procedure is concise (1-2 sentences).
- Ensure the approach is strategic and relevant to the context (2-3 sentences).
- Ensure steps are specific, actionable, and limited to 3-5 items.
- If the goal or content is unclear, provide a general but reasonable plan.
- The response must be valid JSON.
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
            logger.error(f"Perplexity API error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Perplexity API error: {response.text}"
            )
        response_json = response.json()
        logger.debug(f"Perplexity API response: {response_json}")

        message_content = response_json.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not message_content:
            logger.error("Empty response from Perplexity API")
            raise HTTPException(status_code=500, detail="Empty response from Perplexity API")

        # Parse the response as JSON
        result = json.loads(message_content)
        
        # Validate the response structure
        required_keys = ["procedure", "approach", "steps"]
        if not all(key in result for key in required_keys):
            logger.error(f"Missing required fields in response: {result}")
            raise HTTPException(status_code=500, detail="Missing required fields in response")
        
        if not isinstance(result["steps"], list) or len(result["steps"]) < 3 or len(result["steps"]) > 5:
            logger.error(f"Invalid steps format or count: {result['steps']}")
            raise HTTPException(status_code=500, detail="Steps must be a list of 3-5 items")

        return result

    except json.JSONDecodeError:
        logger.error(f"Invalid JSON response: {message_content}")
        raise HTTPException(status_code=500, detail="Invalid JSON format returned by Perplexity API")
    except Exception as e:
        logger.error(f"Error in specify_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to specify goal: {str(e)}")