class ExperienceBuilder:

    def build(self, incident: dict) -> dict:

        if incident["status"] != "resolved":
            raise ValueError(
                "Incident must be resolved."
            )

        failed_attempts = [
            a for a in incident["attempts"]
            if a["result"] == "failed"
        ]

        successful_attempts = [
            a for a in incident["attempts"]
            if a["result"] == "successful"
        ]

        return {
            "incident_id": incident["id"],
            "type": "engineering_experience",

            "problem": {
                "service": incident["service"],
                "error": incident["error"],
                "environment": incident["environment"],
                "version": incident["version"],
                "description": incident["description"]
            },

            "failed_attempts": failed_attempts,

            "successful_attempts": successful_attempts,

            "root_cause": incident["root_cause"],

            "resolution": incident["resolution"],

            "lessons": [
                incident["lesson"]
            ]
        }