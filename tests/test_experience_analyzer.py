from intelligence.experience_analyzer import (
    ExperienceAnalyzer
)


def test_learning_signal_creation():

    analyzer = ExperienceAnalyzer()

    experience = {

        "failed_attempts": [
            {
                "action":
                "Increase pool"
            }
        ],

        "successful_attempts": [
            {
                "action":
                "Rollback deployment"
            }
        ],

        "lessons": [
            "Pool increase ineffective"
        ]
    }

    result = analyzer.analyze(
        experience
    )

    assert (
        result.failed_actions[0]
        ==
        "Increase pool"
    )

    assert (
        result.successful_actions[0]
        ==
        "Rollback deployment"
    )