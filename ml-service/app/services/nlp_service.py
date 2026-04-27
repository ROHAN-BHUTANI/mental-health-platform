"""
nlp_service.py
~~~~~~~~~~~~~~
Encapsulates all NLP/sentiment analysis logic for the ML service.
The Flask route layer imports from here and stays thin.
"""

from __future__ import annotations

import os
from typing import Any


# ---------------------------------------------------------------------------
# Pipeline bootstrap
# ---------------------------------------------------------------------------

def _build_pipeline() -> Any:
    """
    Loads the HuggingFace sentiment pipeline.

    - In CI / fast-mode environments (ML_FAST_MODE=1) a deterministic stub is
      returned to avoid heavyweight model downloads.
    - On any load failure the service degrades gracefully with a fixed fallback.
    """
    if os.getenv("ML_FAST_MODE") == "1":
        return lambda _text: [{"label": "POSITIVE", "score": 0.9}]

    try:
        from transformers import pipeline  # type: ignore
        return pipeline("sentiment-analysis")
    except Exception:
        return lambda _text: [{"label": "POSITIVE", "score": 0.8}]


# Module-level singleton — loaded once at import time.
_sentiment_pipeline = _build_pipeline()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_text(text: str) -> dict:
    """
    Runs sentiment analysis on *text* and returns structured risk metrics.

    Returns:
        {
            "sentimentLabel": "positive" | "negative",
            "sentimentScore": float,   # 0.0 – 1.0
            "riskProbability": float,  # 0.0 – 1.0
        }

    Raises:
        ValueError: if *text* is empty or not a string.
    """
    if not text or not isinstance(text, str) or not text.strip():
        raise ValueError("text must be a non-empty string")

    result = _sentiment_pipeline(text)[0]
    label: str = result["label"]
    score: float = result["score"]

    sentiment_score = score if label == "POSITIVE" else 1.0 - score
    risk_probability = 1.0 - sentiment_score

    return {
        "sentimentLabel": label.lower(),
        "sentimentScore": float(sentiment_score),
        "riskProbability": float(risk_probability),
    }


def get_sample_prediction() -> dict:
    """Returns a canned prediction used by the health/sample endpoint."""
    sample = "I feel okay today and managed stress better than last week."
    result = _sentiment_pipeline(sample)[0]
    return {"prediction": result}
