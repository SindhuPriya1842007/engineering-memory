class ContextMatcher:

    def calculate_score(
        self,
        current: dict,
        historical: dict
    ) -> int:

        score = 0

        if (
            current["service"]
            == historical["problem"]["service"]
        ):
            score += 30

        if (
            current["error"]
            == historical["problem"]["error"]
        ):
            score += 40

        if (
            current["environment"]
            ==
            historical["problem"]["environment"]
        ):
            score += 20

        if (
            current["version"]
            ==
            historical["problem"]["version"]
        ):
            score += 10

        return score