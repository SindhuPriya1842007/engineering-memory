from flask import Blueprint, request, jsonify

from intelligence.recommendation_engine import RecommendationEngine
from intelligence.learning_evolution_engine import LearningEvolutionEngine


recommendation_bp = Blueprint(
    "recommendation",
    __name__
)

recommendation_engine = RecommendationEngine()
learning_engine = LearningEvolutionEngine()


@recommendation_bp.route(
    "/api/memory/recall",
    methods=["POST"]
)
def recall_memory():

    payload = request.get_json()

    current_incident = {
        "service": payload.get("service"),
        "error": payload.get("error"),
        "environment": payload.get("environment"),
        "version": payload.get("version"),
        "description": payload.get("description")
    }

    # --------------------------------------------------
    # MEMBER 3 INTEGRATION POINT
    # Replace this with actual Hindsight retrieval
    # --------------------------------------------------

    retrieved_experiences = payload.get(
        "retrieved_experiences",
        []
    )

    recommendation = (
        recommendation_engine.recommend(
            current_incident,
            retrieved_experiences
        )
    )

    learning = (
        learning_engine.analyze(
            retrieved_experiences
        )
    )

    response = {
        "memory_stage":
            learning["learning_stage"],

        "similar_incidents_found":
            len(retrieved_experiences),

        "confidence":
            recommendation.confidence,

        "recommended_next_step":
            recommendation.recommended_next_step,

        "root_cause":
            recommendation.root_cause,

        "lesson":
            recommendation.lesson,

        "historical_evidence": {

            "failed_actions": [
                {
                    "action": action
                }
                for action
                in recommendation.what_failed
            ],

            "successful_actions": [
                {
                    "action": action
                }
                for action
                in recommendation.what_worked
            ]
        }
    }

    return jsonify(response), 200