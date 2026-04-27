"""
app/__init__.py
~~~~~~~~~~~~~~~
Flask App Factory.
Consolidates app creation, configuration, and blueprint registration.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS


def create_app(test_config=None) -> Flask:
    """
    Creates and configures the Flask application.
    """
    app = Flask(__name__, instance_relative_config=True)

    # Default configuration
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev_secret_key"),
    )

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Enable CORS
    CORS(app)

    # Root route for liveness checks
    @app.route("/")
    def index():
        return jsonify({
            "status": "healthy",
            "service": "MindCare-ML-Service",
            "version": "1.0.0"
        })

    # Register Blueprints
    from app.routes.analysis import analysis_bp
    app.register_blueprint(analysis_bp, url_prefix="/api")

    return app
