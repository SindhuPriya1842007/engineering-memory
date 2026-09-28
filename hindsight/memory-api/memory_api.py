from flask import Flask, request, jsonify

from memory_agent import MemoryAgent


app = Flask(__name__)

agent = MemoryAgent()


@app.get("/")
def home():

    return jsonify({
        "service": "Engineering Memory API",
        "status": "running",
        "endpoints": [
            "POST /memory/retain",
            "POST /memory/recall"
        ]
    })


@app.post("/memory/retain")
def retain():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required."
            }), 400

        if "incident" not in data:
            return jsonify({
                "error": "Missing required field: incident"
            }), 400

        if "experience" not in data:
            return jsonify({
                "error": "Missing required field: experience"
            }), 400

        incident = data["incident"]
        experience = data["experience"]

        result = agent.store_experience(
            incident,
            experience
        )

        return jsonify(result), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


@app.post("/memory/recall")
async def recall():

    try:
        incident = request.get_json()

        if not incident:
            return jsonify({
                "error": "Request body is required."
            }), 400

        result = await agent.investigate_async(
            incident
        )

        return jsonify(result), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


if __name__ == "__main__":

    print(
        "Memory API running on http://localhost:8000"
    )

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False
    )