from collections import Counter
from typing import Any


class LearningEvolutionEngine:
    """
    Tracks how engineering knowledge evolves
    as more experiences are accumulated.

    This engine is designed specifically
    for demonstrating learning progression.
    """

    def analyze(
        self,
        experiences: list[dict[str, Any]]
    ) -> dict[str, Any]:

        memory_size = len(experiences)

        if memory_size == 0:
            return {
                "memory_size": 0,
                "learning_stage": "cold_start",
                "summary": (
                    "No historical engineering "
                    "experience available."
                ),
                "failed_patterns": [],
                "successful_patterns": [],
                "confidence": "0%"
            }

        failed_actions = []
        successful_actions = []

        for experience in experiences:

            for attempt in experience.get(
                "failed_attempts",
                []
            ):
                failed_actions.append(
                    attempt["action"]
                )

            for attempt in experience.get(
                "successful_attempts",
                []
            ):
                successful_actions.append(
                    attempt["action"]
                )

        failed_patterns = (
            Counter(failed_actions)
            .most_common(5)
        )

        successful_patterns = (
            Counter(successful_actions)
            .most_common(5)
        )

        learning_stage = self._determine_stage(
            memory_size
        )

        confidence = self._calculate_confidence(
            memory_size
        )

        return {
            "memory_size": memory_size,
            "learning_stage": learning_stage,
            "summary": self._build_summary(
                memory_size
            ),
            "failed_patterns": [
                {
                    "action": action,
                    "count": count
                }
                for action, count
                in failed_patterns
            ],
            "successful_patterns": [
                {
                    "action": action,
                    "count": count
                }
                for action, count
                in successful_patterns
            ],
            "confidence": f"{confidence}%"
        }

    def _determine_stage(
        self,
        memory_size: int
    ) -> str:

        if memory_size == 0:
            return "cold_start"

        if memory_size <= 5:
            return "early_learning"

        if memory_size <= 20:
            return "team_learning"

        return "institutional_memory"

    def _calculate_confidence(
        self,
        memory_size: int
    ) -> int:

        return min(
            memory_size * 5,
            95
        )

    def _build_summary(
        self,
        memory_size: int
    ) -> str:

        if memory_size <= 5:
            return (
                "The system has begun learning "
                "from previous incidents."
            )

        if memory_size <= 20:
            return (
                "The system can identify recurring "
                "engineering patterns and failed "
                "investigation paths."
            )

        return (
            "The system has accumulated substantial "
            "engineering memory and can provide "
            "high-confidence recommendations."
        )