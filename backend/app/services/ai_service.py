import httpx
from app.config import settings


async def call_llm(prompt: str, system: str = "") -> str:
    """Call the configured LLM API and return the response text."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{settings.AI_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
            json={
                "model": settings.AI_MODEL,
                "messages": messages,
                "temperature": 0.7,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def generate_interview_summary(transcript: str) -> dict:
    """AI generates summary and extracts requirements from a transcript."""
    prompt = f"""Analyze the following interview transcript and return:
1. A concise summary (2-3 paragraphs)
2. Key pain points (as a list)
3. Feature requests (as a list)
4. Sentiment (positive / neutral / negative)

Transcript:
{transcript}
"""
    result = await call_llm(prompt, system="You are a user research analyst.")
    return {"raw": result}


async def generate_prd_content(requirements: list[str], template_type: str = "standard") -> str:
    """AI generates PRD markdown content from a list of requirements."""
    req_text = "\n".join(f"- {r}" for r in requirements)
    prompt = f"""Based on the following requirements, generate a complete PRD document in Markdown format.
Template type: {template_type}

Requirements:
{req_text}

Include sections: Background, Goals, User Stories, Functional Requirements, Acceptance Criteria, Non-functional Requirements.
"""
    return await call_llm(prompt, system="You are a senior product manager.")


async def generate_sitemap(prd_content: str) -> dict:
    """AI generates information architecture / sitemap from PRD content."""
    prompt = f"""Based on the following PRD, generate a site map in JSON format.
Return a tree structure with "name", "route", and "children" fields.

PRD:
{prd_content[:3000]}
"""
    result = await call_llm(prompt, system="You are a UX architect. Return only valid JSON.")
    # In production, parse JSON safely
    return {"raw": result}
