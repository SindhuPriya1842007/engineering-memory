from collections import Counter
from typing import Any

from domain.recommendation import Recommendation


class RecommendationEngine:
    """
    Generates recommendations from historical
    engineering experiences.
    """

    def recommend(
        self,
        current_incident: dict[str, Any],
        experiences: list[dict[str, Any]]
    ) -> Recommendation:

        if not experiences:
            return self._build_generic_recommendation()

        best_match = self._find_best_match(
            current_incident,
            experiences
        )

        failed_actions = self._collect_actions(
            experiences,
            "failed_attempts"
        )

        successful_actions = self._collect_actions(
            experiences,
            "successful_attempts"
        )

        recommended_action = self._find_most_common(
            successful_actions
        )

        confidence = self._calculate_confidence(
            current_incident,
            best_match
        )

        return Recommendation(
            mode="experience_based",
            similar_incident=best_match["incident_id"],
            what_failed=sorted(set(failed_actions)),
            what_worked=sorted(set(successful_actions)),
            root_cause=best_match.get("root_cause"),
            recommended_next_step=recommended_action,
            lesson=self._extract_lesson(best_match),
            confidence=confidence
        )

    def _build_generic_recommendation(
        self
    ) -> Recommendation:

        return Recommendation(
            mode="generic",
            similar_incident=None,
            what_failed=[],
            what_worked=[],
            root_cause=None,
            recommended_next_step=(
                "No similar historical incident found. "
                "Begin standard investigation."
            ),
            lesson=None,
            confidence=0
        )

    def _collect_actions(
    self,
    experiences: list[dict[str, Any]],
    key: str
    ) -> list[str]:

        actions: list[str] = []

        for experience in experiences:
            for attempt in experience.get(key, []):
                actions.append(
                attempt["action"]
                )

        return actions

    def _find_most_common(
        self,
        actions: list[str]
    ) -> str:

        if not actions:
            return "Investigate root cause"

        return Counter(
            actions
        ).most_common(1)[0][0]

    def _extract_lesson(
        self,
        experience: dict[str, Any]
    ) -> str | None:

        lessons = experience.get(
            "lessons",
            []
        )

        if not lessons:
            return None

        return lessons[0]

    def _find_best_match(
        self,
        current_incident: dict[str, Any],
        experiences: list[dict[str, Any]]
    ) -> dict[str, Any]:

        ranked = []

        for experience in experiences:
            score = self._calculate_confidence(
                current_incident,
                experience
            )

            ranked.append(
                (score, experience)
            )

        ranked.sort(
            key=lambda item: item[0],
            reverse=True
        )

        return ranked[0][1]

    def _calculate_confidence(
        self,
        current_incident: dict[str, Any],
        experience: dict[str, Any]
    ) -> int:

        score = 0

        problem = experience["problem"]

        if (
            current_incident["service"]
            == problem["service"]
        ):
            score += 30

        if (
            current_incident["error"]
            == problem["error"]
        ):
            score += 40

        if (
            current_incident["environment"]
            == problem["environment"]
        ):
            score += 20

        if (
            current_incident["version"]
            == problem["version"]
        ):
            score += 10

        return min(score, 100)