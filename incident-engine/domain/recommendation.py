from dataclasses import dataclass, field
from typing import List


@dataclass(frozen=True)
class Recommendation:
    """
    Final recommendation produced by the
    RecommendationEngine.

    This is the object that the UI/API layer
    will display to engineers.
    """

    mode: str

    similar_incident: str | None

    what_failed: List[str] = field(
        default_factory=list
    )

    what_worked: List[str] = field(
        default_factory=list
    )

    root_cause: str | None = None

    recommended_next_step: str | None = None

    lesson: str | None = None

    confidence: int = 0

    def to_dict(self) -> dict:
        """
        Convert recommendation into a
        JSON-friendly response.
        """

        return {
            "mode": self.mode,

            "similar_incident":
                self.similar_incident,

            "what_failed":
                self.what_failed,

            "what_worked":
                self.what_worked,

            "root_cause":
                self.root_cause,

            "recommended_next_step":
                self.recommended_next_step,

            "lesson":
                self.lesson,

            "confidence":
                f"{self.confidence}%"
        }