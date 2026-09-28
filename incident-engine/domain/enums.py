from enum import Enum


class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"


class AttemptResult(str, Enum):
    FAILED = "failed"
    SUCCESSFUL = "successful"
    