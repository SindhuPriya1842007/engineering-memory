from flask import Flask
from api.recommendation_routes import recommendation_bp

app = Flask(__name__)
app.register_blueprint(recommendation_bp)

@app.get('/')
def health():
    return {"service": "Engineering Incident Intelligence", "status": "running"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8100, debug=False)
