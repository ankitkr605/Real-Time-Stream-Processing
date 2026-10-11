# Sentiment Twitter - Local ML Deployment

A Twitter-like web interface for deploying your sentiment analysis model locally. This application provides a fully functional Twitter-style UI where users can input text and get real-time sentiment predictions from your trained Decision Tree model.

## Features

- **Twitter-like Interface**: Authentic 3-column Twitter layout with sidebar navigation, main feed, and trends panel
- **Real-time Sentiment Analysis**: Click "Tweet" to instantly analyze sentiment using your ML model
- **Visual Sentiment Badges**: Color-coded badges (Green for Positive, Red for Negative) displayed on each tweet
- **Demo Mode**: Includes sample tweets to demonstrate the UI
- **Responsive Design**: Works on desktop and mobile screens
- **Keyboard Shortcuts**: Press Enter to submit tweets

## Project Structure

```
sentiment_twitter/
├── app.py                 # Flask backend with model loading and prediction
├── templates/
│   └── index.html         # Twitter-like HTML structure
├── static/
│   ├── style.css          # Complete Twitter-inspired styling
│   └── script.js          # Frontend logic for interactions
├── test.js                # Playwright test script
├── README.md              # This file
└── package.json           # NPM configuration for testing
```

## Installation

### 1. Install Required Python Packages

Open your terminal or command prompt and run:

```bash
pip install flask joblib scikit-learn
```

### 2. Verify Your Model Files

Ensure your trained model files are in the correct location:

- `C:\Users\HP\Downloads\models\decision_tree_100k_data.pkl`
- `C:\Users\HP\Downloads\models\tfidf_vectorizer.pkl`

If your files are in a different location, update the paths in `app.py`:

```python
# Lines 12-13 in app.py
MODEL_PATH = r'C:\Your\Custom\Path\decision_tree_100k_data.pkl'
VECTORIZER_PATH = r'C:\Your\Custom\Path\tfidf_vectorizer.pkl'
```

## Running the Application

### 1. Navigate to the Project Directory

```bash
cd path\to\sentiment_twitter
```

### 2. Start the Flask Server

```bash
python app.py
```

You should see output similar to:

```
Loading model from: C:\Users\HP\Downloads\models\decision_tree_100k_data.pkl
Loading vectorizer from: C:\Users\HP\Downloads\models\tfidf_vectorizer.pkl
Models loaded successfully!
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 3. Open in Browser

Navigate to: **http://127.0.0.1:5000**

## Usage

1. **Type a message** in the "What's happening?" text box
2. **Click "Tweet"** or press **Enter** to submit
3. **View the sentiment** - A badge will appear showing "Positive" (green) or "Negative" (red)
4. **Watch your feed** grow as you analyze more text

### Example Inputs

- **Positive**: "I absolutely love this product! Best purchase ever."
- **Negative**: "This is terrible, I hate it. Waste of money."
- **Negative**: "My flight was delayed and the staff was rude."

## How It Works

### Backend (app.py)

The Flask application:

1. **Loads your trained model** on startup using `joblib.load()`
2. **Provides a REST API endpoint** at `/predict`:
   - Accepts JSON POST requests with text input
   - Cleans the text (lowercase, remove URLs, mentions, hashtags)
   - Transforms text using your TF-IDF vectorizer
   - Predicts sentiment using your Decision Tree model
   - Returns JSON response with sentiment and timestamp

3. **Health check endpoint** at `/health` to verify model status

### Frontend (HTML/CSS/JS)

The web interface:

1. **Mimics Twitter's design** with familiar navigation, tweet box, and feed layout
2. **Sends AJAX requests** to the backend using the Fetch API
3. **Dynamically updates** the feed without page reloads
4. **Displays sentiment badges** with color-coded styling

## Customization

### Changing Colors

Edit `static/style.css` to customize sentiment colors:

```css
.sentiment-badge.Positive {
    color: #17BF63;  /* Green - Change to your preferred color */
    background: rgba(23, 191, 99, 0.15);
}

.sentiment-badge.Negative {
    color: #E0245E;  /* Red - Change to your preferred color */
    background: rgba(224, 36, 94, 0.15);
}
```

### Adding More UI Elements

The interface supports all standard Twitter interactions:
- Reply icons
- Retweet buttons  
- Like/favorite buttons
- Share functionality

These are visual-only in the demo but can be connected to a backend if needed.

## Testing

### Automated Testing with Playwright

The project includes a Playwright test script to verify functionality:

```bash
# Install Playwright
npm init -y
npm install playwright

# Run the test
node test.js
```

### Manual Testing

1. **Initialization Test**: Verify the page loads with demo tweets
2. **Positive Flow**: Type "I love this!" and click Tweet → Green "Positive" badge should appear
3. **Negative Flow**: Type "This is terrible" and click Tweet → Red "Negative" badge should appear
4. **Empty Input**: Verify the Tweet button is disabled when input is empty

## Troubleshooting

### Model Files Not Found

```
Error loading models: [Errno 2] No such file or directory
```

**Solution**: Verify your model paths in `app.py` (lines 12-13) are correct.

### Port Already in Use

```
Address already in use: 5000
```

**Solution**: Change the port in `app.py` line 91:
```python
app.run(debug=True, port=5001)  # Use a different port
```

### Import Errors

```
ModuleNotFoundError: No module named 'flask'
```

**Solution**: Reinstall the required packages:
```bash
pip install flask joblib scikit-learn
```

### CORS Errors (if accessing from different domain)

Add CORS support to `app.py`:
```python
from flask_cors import CORS
CORS(app)
```

## Notes

- This is a **development server** - do not use in production
- The model uses your original cleaning function for consistency
- Demo tweets are included to showcase the UI but aren't analyzed
- All predictions use your trained Decision Tree model

## Credits

Built with:
- **Flask** - Python web framework
- **scikit-learn** - ML model and vectorizer
- **Font Awesome** - Icons
- **Playwright** - Automated testing

---

**Enjoy analyzing sentiments!** 🎉
