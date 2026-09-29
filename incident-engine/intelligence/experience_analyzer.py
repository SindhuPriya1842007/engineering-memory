from domain.models import LearningSignal


class ExperienceAnalyzer:

    def analyze(
        self,
        experience: dict
    ) -> LearningSignal:

        failed_actions = [
            item["action"]
            for item in experience["failed_attempts"]
        ]

        successful_actions = [
            item["action"]
            for item in experience["successful_attempts"]
        ]

        lesson = experience["lessons"][0]

        return LearningSignal(
            failed_actions=failed_actions,
            successful_actions=successful_actions,
            lesson=lesson
        )