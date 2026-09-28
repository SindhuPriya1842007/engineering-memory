import json

from memory_agent import MemoryAgent


agent = MemoryAgent()


with open("incidents.json", "r") as file:
    data = json.load(file)


new_incident = data["new_incident"]


print("Testing RECALL + REASONING...")


result = agent.investigate(
    new_incident
)


print("\nAgent recommendation:")

print(
    json.dumps(
        result["recommendation"],
        indent=2
    )
)