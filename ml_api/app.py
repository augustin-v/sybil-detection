from flask import Flask, request, jsonify
import pandas as pd
import joblib
import numpy as np
model = joblib.load('stark_chan_v2.pkl')

app = Flask(__name__)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    df = pd.DataFrame(data)

    print(f"Input Data: {df}")

    features = ['block_number', 'fee_in_eth', 'tx_count', 'time_diff', 'avg_fee', 'std_fee']
    if not all(col in df.columns for col in features):
        return jsonify({'error': 'Missing required features'}), 400

    decision_scores = model.decision_function(df[features])

    print(f"Decision Scores: {decision_scores}")

    # Round the decision scores to one decimal place
    rounded_scores = np.round(decision_scores, 1)

    anomalies = rounded_scores < 0 

    return jsonify({'decision_scores': rounded_scores.tolist(), 'anomalies': anomalies.tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
