import json
import os

from groq import Groq
from hindsight_client import Hindsight


class MemoryAgent:

    def __init__(self):
        self.hindsight = Hindsight(
        base_url="http://127.0.0.1:8888"
        )

        self.groq = Groq(
            api_key=os.environ["HINDSIGHT_API_LLM_API_KEY"]
        )

        self.bank_id = "engineering-memory"

    def store_experience(self, incident, experience):
        """
        Store a resolved engineering incident in organizational memory.
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

        self.hindsight.retain(
            bank_id=self.bank_id,
            content=memory,
            context="engineering incident experience"
        )

        return {
            "status": "stored",
            "incident_id": incident["id"]
        }

    def find_similar_experiences(self, incident):
        """
        Retrieve relevant previous engineering experiences.
        """

        query = f"""
Service: {incident["service"]}
Error type: {incident["error"]["type"]}
Error message: {incident["error"]["message"]}
Environment: {incident["environment"]}
Version: {incident["version"]}
Description: {incident["description"]}
"""

        results = self.hindsight.recall(
            bank_id=self.bank_id,
            query=query
        )

        memories = [
            result.text
            for result in results.results[:5]
        ]

        return memories

    def generate_recommendation(self, incident, memories):
        """
        Use recalled organizational memory to reason about
        the current incident.
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

    def investigate(self, incident):
        """
        Investigate a new incident using organizational memory.
        """

        memories = self.find_similar_experiences(
            incident
        )

        recommendation = self.generate_recommendation(
            incident,
            memories
        )

        return {
            "incident_id": incident["id"],
            "recommendation": recommendation
        }