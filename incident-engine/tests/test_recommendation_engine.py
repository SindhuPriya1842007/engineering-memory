from intelligence.recommendation_engine import RecommendationEngine


def test_returns_generic_recommendation_when_no_experiences():

    engine = RecommendationEngine()

    current_incident = {
        "service": "Order Service",
        "error": "ConnectionResetError",
        "environment": "Production",
        "version": "2.8.1"
    }

    recommendation = engine.recommend(
        current_incident,
        []
    )

    assert recommendation.mode == "generic"
    assert recommendation.confidence == 0
    assert recommendation.similar_incident is None


def test_returns_experience_based_recommendation():

    engine = RecommendationEngine()

    current_incident = {
        "service": "Order Service",
        "error": "ConnectionResetError",
        "environment": "Production",
        "version": "2.8.1"
    }

    experiences = [
        {
            "incident_id": "INC-104",

            "problem": {
                "service": "Order Service",
                "error": "ConnectionResetError",
                "environment": "Production",
                "version": "2.8.1"
            },

            "failed_attempts": [
                {
                    "action": "Increase connection pool"
                }
            ],

            "successful_attempts": [
                {
                    "action": "Revert connection-handling change"
                }
            ],

            "root_cause": "Connection lifecycle bug",

            "lessons": [
                "Connection pool increase did not help"
            ]
        }
    ]

    recommendation = engine.recommend(
        current_incident,
        experiences
    )

    assert recommendation.mode == "experience_based"

    assert (
        recommendation.similar_incident
        == "INC-104"
    )

    assert (
        recommendation.root_cause
        == "Connection lifecycle bug"
    )

    assert (
        recommendation.recommended_next_step
        == "Revert connection-handling change"
    )


def test_collects_failed_attempts():

    engine = RecommendationEngine()

    current_incident = {
        "service": "Order Service",
        "error": "ConnectionResetError",
        "environment": "Production",
        "version": "2.8.1"
    }

    experiences = [
        {
            "incident_id": "INC-104",

            "problem": {
                "service": "Order Service",
                "error": "ConnectionResetError",
                "environment": "Production",
                "version": "2.8.1"
            },

            "failed_attempts": [
                {
                    "action": "Increase connection pool"
                },
                {
                    "action": "Modify retry configuration"
                }
            ],

            "successful_attempts": [
                {
                    "action": "Revert connection-handling change"
                }
            ],

            "root_cause": "Connection lifecycle bug",

            "lessons": [
                "Pool increase ineffective"
            ]
        }
    ]

    recommendation = engine.recommend(
        current_incident,
        experiences
    )

    assert (
        "Increase connection pool"
        in recommendation.what_failed
    )

    assert (
        "Modify retry configuration"
        in recommendation.what_failed
    )


def test_confidence_is_100_for_exact_match():

    engine = RecommendationEngine()

    incident = {
        "service": "Order Service",
        "error": "ConnectionResetError",
        "environment": "Production",
        "version": "2.8.1"
    }

    experience = {
        "incident_id": "INC-104",

        "problem": {
            "service": "Order Service",
            "error": "ConnectionResetError",
            "environment": "Production",
            "version": "2.8.1"
        },

        "failed_attempts": [],
        "successful_attempts": [],
        "root_cause": None,
        "lessons": []
    }

    confidence = (
        engine._calculate_confidence(
            incident,
            experience
        )
    )

    assert confidence == 100


def test_confidence_drops_for_partial_match():

    engine = RecommendationEngine()

    current = {
        "service": "Order Service",
        "error": "ConnectionResetError",
        "environment": "Production",
        "version": "2.8.1"
    }

    experience = {
        "incident_id": "INC-200",

        "problem": {
            "service": "User Service",
            "error": "ConnectionResetError",
            "environment": "Staging",
            "version": "3.0.0"
        },

        "failed_attempts": [],
        "successful_attempts": [],
        "root_cause": None,
        "lessons": []
    }

    confidence = (
        engine._calculate_confidence(
            current,
            experience
        )
    )

    assert confidence == 40


def test_recommends_most_common_successful_action():

    engine = RecommendationEngine()

    current_incident = {
        "service": "Order Service",
        "error": "ConnectionResetError",
        "environment": "Production",
        "version": "2.8.1"
    }

    experiences = [
        {
            "incident_id": "INC-101",

            "problem": current_incident,

            "failed_attempts": [],

            "successful_attempts": [
                {
                    "action":
                    "Revert connection-handling change"
                }
            ],

            "root_cause": "Bug",
            "lessons": []
        },
        {
            "incident_id": "INC-102",

            "problem": current_incident,

            "failed_attempts": [],

            "successful_attempts": [
                {
                    "action":
                    "Revert connection-handling change"
                }
            ],

            "root_cause": "Bug",
            "lessons": []
        }
    ]

    recommendation = engine.recommend(
        current_incident,
        experiences
    )

    assert (
        recommendation.recommended_next_step
        == "Revert connection-handling change"
    )