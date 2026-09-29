from dataclasses import dataclass, field
from typing import List


@dataclass
class Attempt:
    action: str
    result: str
    notes: str


@dataclass
class LearningSignal:
    failed_actions: List[str]
    successful_actions: List[str]
    lesson: str


@dataclass
class Recommendation:
    priority_action: str
    avoid_actions: List[str]
    evidence: List[str]
    confidence: str