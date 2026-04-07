from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

sentiment_pipeline = pipeline("sentiment-analysis")

@app.route("/")
def health():
    return jsonify({"status": "ml-service running"})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = sentiment_pipeline(text)[0]

    label = result["label"]
    score = result["score"]

    sentiment_score = score if label == "POSITIVE" else 1 - score
    risk_probability = 1 - sentiment_score

    return jsonify({
        "sentimentLabel": label.lower(),
        "sentimentScore": float(sentiment_score),
        "riskProbability": float(risk_probability)
    })

@app.route("/predict-sample")
def predict_sample():
    sample = "I feel okay today and managed stress better than last week."
    result = sentiment_pipeline(sample)[0]
    return jsonify({"prediction": result})

if __name__ == "__main__":
    app.run(port=5001)
