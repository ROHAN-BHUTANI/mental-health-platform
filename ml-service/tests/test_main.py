import os

os.environ["ML_FAST_MODE"] = "1"

from app.main import app

def test_home():
    client = app.test_client()
    res = client.get('/')
    assert res.status_code == 200
    assert res.get_json().get('status') == 'ml-service running'


def test_predict_sample():
    client = app.test_client()
    res = client.get('/predict-sample')
    assert res.status_code == 200
    assert 'prediction' in res.get_json()
