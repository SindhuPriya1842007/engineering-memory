import json
import os

from groq import Groq
from hindsight_client import Hindsight


class MemoryAgent:

    def __init__(self):
        self.groq = Groq(
            api_key=os.environ["HINDSIGHT_API_LLM_API_KEY"]
        )

    def store_experience(self, bank_id, incident, experience):
        """
        Store a resolved engineering incident
        in the company's isolated memory bank.
        """

        memory = f"""
Incident {incident["id"]} occurred in the {incident["service"]} service.

Environment: {incident["environment"]}
Version: {incident["version"]}

Error type: {incident["error"]["type"]}
Error message: {incident["error"]["message"]}

Description:
{incident["description"]}

Attempts:
"""

        for attempt in incident["attempts"]:
            memory += (
                f'- {attempt["action"]}: {attempt["result"]}'
                f' — {attempt.get("notes", "")}\n'
            )

        memory += f"""
Root cause: {experience["root_cause"]}
Resolution: {experience["resolution"]}
Lesson: {experience["lesson"]}
"""

        hindsight = Hindsight(
            base_url="http://127.0.0.1:8888"
        )

        try:
            hindsight.retain(
                bank_id=bank_id,
                content=memory,
                context="engineering incident experience"
            )
        finally:
            self._close_hindsight(hindsight)

        return {
            "status": "stored",
            "incident_id": incident["id"],
            "bank_id": bank_id
        }

    async def find_similar_experiences(self, bank_id, incident):
        """
        Retrieve relevant previous engineering experiences
        from the company's isolated memory bank.
        """

        query = f"""
Service: {incident["service"]}
Error type: {incident["error"]["type"]}
Error message: {incident["error"]["message"]}
Environment: {incident["environment"]}
Version: {incident["version"]}
Description: {incident["description"]}
"""

        hindsight = Hindsight(
            base_url="http://127.0.0.1:8888"
        )

        try:
            results = await hindsight.arecall(
                bank_id=bank_id,
                query=query
            )

            memories = [
                result.text
                for result in results.results[:5]
            ]

            return memories

        finally:
            await hindsight.aclose()

    def generate_recommendation(self, incident, memories):
        """
        Use recalled organizational memory to reason
        about the current incident.
        """

        memory_context = "\n\n".join(memories)

        prompt = f"""
You are an engineering incident-response assistant.

A new production incident has occurred:

{json.dumps(incident, indent=2)}

Relevant organizational memories:

{memory_context}

Use ONLY information contained in the memories when describing
previous incidents, attempts, fixes, root causes, resolutions,
lessons, and outcomes.

Do NOT invent historical facts.

If something is not present in memory, say "unknown".

Separate remembered facts from your own investigation suggestions.

Return ONLY valid JSON.

Use exactly this structure:

{{
  "similar_incident": {{
    "incident_id": "...",
    "facts": []
  }},
  "failed_approaches": [],
  "successful_approaches": [],
  "investigate_now": [],
  "caution": ""
}}

Rules:

- Use ONLY information contained in the provided memories for historical facts.
- Do not invent historical incidents, fixes, causes, resolutions, lessons, or outcomes.
- Put new investigation ideas only in "investigate_now".
- If a historical fact is unknown, say "unknown".
- Keep the response concise.
- Do not use Markdown.
- Do not wrap the JSON in a code block.
"""

        response = self.groq.chat.completions.create(
            model="openai/gpt-oss-20b",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        return json.loads(
            response.choices[0].message.content
        )

    async def investigate_async(self, bank_id, incident):
        """
        Investigate a new incident using the company's
        isolated organizational memory.
        """

        memories = await self.find_similar_experiences(
            bank_id,
            incident
        )

        recommendation = self.generate_recommendation(
            incident,
            memories
        )

        return {
            "incident_id": incident["id"],
            "bank_id": bank_id,
            "recommendation": recommendation
        }

    @staticmethod
    def _close_hindsight(hindsight):
        """
        Close a synchronous Hindsight client if supported.
        """

        close_method = getattr(hindsight, "close", None)

        if close_method:
            close_method()