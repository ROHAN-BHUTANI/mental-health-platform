"""
run.py
~~~~~~
Entry point for the ML service.
Imports the app factory and runs the development server.
"""

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    # In production, use a WSGI server like Gunicorn instead of app.run()
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "True") == "True")
