import os
from flask import Flask, render_template, request, jsonify
import joblib
import re
import datetime

app = Flask(__name__)

# ==========================================
# MODEL CONFIGURATION
# ==========================================
import os

# Use Windows paths on Windows, local paths on other systems
if os.name == 'nt':  # Windows
    MODEL_PATH = r'E:\Final_College_project\model\models\logistic_regression_1m_data.pkl'
    VECTORIZER_PATH = r'E:\Final_College_project\model\models\tfidf_vectorizer.pkl'
else:  # Linux/Other - use local files
    # Check for model files in current directory or parent
    base_paths = [
        '/workspace/sentiment_twitter',
        '/workspace',
        os.path.dirname(os.path.abspath(__file__))
    ]
    
    MODEL_PATH = None
    VECTORIZER_PATH = None
    
    for base in base_paths:
        model_candidate = os.path.join(base, 'decision_tree_100k_data.pkl')
        vectorizer_candidate = os.path.join(base, 'tfidf_vectorizer.pkl')
        
        if os.path.exists(model_candidate):
            MODEL_PATH = model_candidate
        if os.path.exists(vectorizer_candidate):
            VECTORIZER_PATH = vectorizer_candidate
    
    # If still not found, use default paths
    if not MODEL_PATH:
        MODEL_PATH = '/workspace/sentiment_twitter/decision_tree_100k_data.pkl'
    if not VECTORIZER_PATH:
        VECTORIZER_PATH = '/workspace/sentiment_twitter/tfidf_vectorizer.pkl'

# Global variables for models
model = None
vectorizer = None

# Viral prediction models
rf_viral_model = None
gb_viral_model = None

# Paths for Viral Models
if os.name == 'nt':
    RF_MODEL_PATH = r'E:\Final_College_project\model\models\rf_viral_model.pkl'
    GB_MODEL_PATH = r'E:\Final_College_project\model\models\gb_viral_model.pkl'
else:
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RF_MODEL_PATH = os.path.join(base, 'models', 'rf_viral_model.pkl')
    GB_MODEL_PATH = os.path.join(base, 'models', 'gb_viral_model.pkl')

# ==========================================
# LOAD MODELS ON STARTUP
# ==========================================
def load_models():
    global model, vectorizer, rf_viral_model, gb_viral_model
    try:
        print(f"Loading sentiment model from: {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
        print(f"Loading vectorizer from: {VECTORIZER_PATH}")
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("Sentiment Models loaded successfully!")
    except FileNotFoundError as e:
        print(f"Error loading sentiment models: {e}")
        
    try:
        print(f"Loading RF Viral Model from: {RF_MODEL_PATH}")
        rf_viral_model = joblib.load(RF_MODEL_PATH)
        print(f"Loading GB Viral Model from: {GB_MODEL_PATH}")
        gb_viral_model = joblib.load(GB_MODEL_PATH)
        print("Viral Models loaded successfully!")
    except FileNotFoundError as e:
        print(f"Error loading viral prediction models: {e}")

# ==========================================
# CLEANING FUNCTION (Must match training)
# ==========================================
def clean_tweet(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\@\w+|\#', '', text)
    return text

# ==========================================
# ROUTES
# ==========================================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not vectorizer:
        return jsonify({'error': 'Models not loaded'}), 500
    
    data = request.json
    text_input = data.get('text', '')
    
    if not text_input:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Clean and transform the text
        cleaned_text = clean_tweet(text_input)
        text_vector = vectorizer.transform([cleaned_text])
        
        # Predict
        prediction = model.predict(text_vector)[0]
        
        # Determine sentiment label
        # Based on user's original code: 1 = Positive, else Negative
        sentiment = "Positive" if prediction == 1 else "Negative"
        
        return jsonify({
            'sentiment': sentiment,
            'text': text_input,
            'timestamp': datetime.datetime.now().strftime("%H:%M · %b %d, %Y")
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict_viral', methods=['POST'])
def predict_viral():
    if not rf_viral_model or not gb_viral_model:
        return jsonify({'error': 'Viral models not loaded'}), 500
    
    data = request.json
    try:
        likes = float(data.get('likes', 0))
        comments = float(data.get('comments', 0))
        shares = float(data.get('shares', 0))
        posting_time = float(data.get('posting_time', 0))
        
        # Format the input for sklearn (2D array)
        features = [[likes, comments, shares, posting_time]]
        
        # Predict using both models
        rf_pred = rf_viral_model.predict(features)[0]
        gb_pred = gb_viral_model.predict(features)[0]
        
        # Determine labels
        rf_label = "Viral" if rf_pred == 1 else "Not Viral"
        gb_label = "Viral" if gb_pred == 1 else "Not Viral"
        
        return jsonify({
            'rf_prediction': rf_label,
            'gb_prediction': gb_label,
            'features': {
                'likes': likes,
                'comments': comments,
                'shares': shares,
                'posting_time': posting_time
            },
            'timestamp': datetime.datetime.now().strftime("%H:%M · %b %d, %Y")
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    if model is not None and vectorizer is not None:
        return jsonify({'status': 'ready', 'message': 'Models loaded successfully'})
    else:
        return jsonify({'status': 'loading', 'message': 'Models not loaded yet'})

if __name__ == '__main__':
    load_models()
    app.run(debug=True, port=5000)
