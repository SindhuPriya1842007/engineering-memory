from intelligence.learning_evolution_engine import (
    LearningEvolutionEngine
)


def test_empty_memory():

    engine = LearningEvolutionEngine()

    result = engine.analyze([])

    assert result["memory_size"] == 0
    assert result["learning_stage"] == "cold_start"
    assert result["failed_patterns"] == []
    assert result["successful_patterns"] == []
    assert result["confidence"] == "0%"


def test_single_experience():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [
                {
                    "action": "Increase pool"
                }
            ],
            "successful_attempts": [
                {
                    "action": "Rollback deployment"
                }
            ]
        }
    ]

    result = engine.analyze(experiences)

    assert result["memory_size"] == 1
    assert result["learning_stage"] == "early_learning"

    assert (
        result["failed_patterns"][0]["action"]
        == "Increase pool"
    )

    assert (
        result["successful_patterns"][0]["action"]
        == "Rollback deployment"
    )


def test_detects_learning_patterns():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [
                {"action": "Increase pool"}
            ],
            "successful_attempts": [
                {"action": "Rollback deployment"}
            ]
        },
        {
            "failed_attempts": [
                {"action": "Increase pool"}
            ],
            "successful_attempts": [
                {"action": "Rollback deployment"}
            ]
        }
    ]

    result = engine.analyze(experiences)

    assert result["memory_size"] == 2

    assert (
        result["failed_patterns"][0]["action"]
        == "Increase pool"
    )

    assert (
        result["failed_patterns"][0]["count"]
        == 2
    )

    assert (
        result["successful_patterns"][0]["count"]
        == 2
    )


def test_experience_without_attempts():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [],
            "successful_attempts": []
        }
    ]

    result = engine.analyze(experiences)

    assert result["memory_size"] == 1
    assert result["failed_patterns"] == []
    assert result["successful_patterns"] == []


def test_missing_attempt_keys():

    engine = LearningEvolutionEngine()

    experiences = [
        {}
    ]

    result = engine.analyze(experiences)

    assert result["memory_size"] == 1
    assert result["failed_patterns"] == []
    assert result["successful_patterns"] == []


def test_team_learning_stage():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [],
            "successful_attempts": []
        }
        for _ in range(10)
    ]

    result = engine.analyze(experiences)

    assert (
        result["learning_stage"]
        == "team_learning"
    )


def test_institutional_memory_stage():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [],
            "successful_attempts": []
        }
        for _ in range(25)
    ]

    result = engine.analyze(experiences)

    assert (
        result["learning_stage"]
        == "institutional_memory"
    )


def test_confidence_is_capped():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [],
            "successful_attempts": []
        }
        for _ in range(100)
    ]

    result = engine.analyze(experiences)

    assert result["confidence"] == "95%"


def test_only_failed_actions():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [
                {
                    "action": "Increase pool"
                }
            ],
            "successful_attempts": []
        }
    ]

    result = engine.analyze(experiences)

    assert len(
        result["failed_patterns"]
    ) == 1

    assert (
        result["successful_patterns"]
        == []
    )


def test_only_successful_actions():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [],
            "successful_attempts": [
                {
                    "action": "Rollback deployment"
                }
            ]
        }
    ]

    result = engine.analyze(experiences)

    assert (
        result["failed_patterns"]
        == []
    )

    assert len(
        result["successful_patterns"]
    ) == 1


def test_top_pattern_ordering():

    engine = LearningEvolutionEngine()

    experiences = [
        {
            "failed_attempts": [
                {"action": "Increase pool"}
            ],
            "successful_attempts": []
        },
        {
            "failed_attempts": [
                {"action": "Increase pool"}
            ],
            "successful_attempts": []
        },
        {
            "failed_attempts": [
                {"action": "Retry config"}
            ],
            "successful_attempts": []
        }
    ]

    result = engine.analyze(experiences)

    assert (
        result["failed_patterns"][0]["action"]
        == "Increase pool"
    )

    assert (
        result["failed_patterns"][0]["count"]
        == 2
    )