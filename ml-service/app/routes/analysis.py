"""
routes/analysis.py
~~~~~~~~~~~~~~~~~~
Flask Blueprint for the /analyze and /predict-sample endpoints.
Route handlers stay thin — all NLP work is delegated to nlp_service.
"""

from flask import Blueprint, request, jsonify
from app.services.nlp_service import analyze_text, get_sample_prediction

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts a JSON body ``{ "text": "..." }`` and returns sentiment metrics.

    Responses
    ---------
    200 OK:
        { "sentimentLabel": str, "sentimentScore": float, "riskProbability": float }
    400 Bad Request:
        { "error": str }
    """
    data = request.get_json(silent=True) or {}
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        result = analyze_text(text)
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@analysis_bp.route("/predict-sample")
def predict_sample():
    """Returns a demo prediction using a canned input sentence."""
    result = get_sample_prediction()
    return jsonify(result), 200
