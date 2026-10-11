import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Features: likes, comments, shares, posting_time (hour 0-23)
# To make realistic data, viral posts generally have high engagement metrics.

np.random.seed(42)

# Generate 5,000 synthetic records
n_samples = 5000

# Non-viral posts (label 0)
likes_norm = np.random.normal(loc=50, scale=50, size=int(n_samples * 0.8))
comments_norm = np.random.normal(loc=10, scale=15, size=int(n_samples * 0.8))
shares_norm = np.random.normal(loc=5, scale=10, size=int(n_samples * 0.8))
time_norm = np.random.randint(0, 24, size=int(n_samples * 0.8))
label_norm = np.zeros(int(n_samples * 0.8))

# Viral posts (label 1)
likes_viral = np.random.normal(loc=120, scale=60, size=int(n_samples * 0.2))
comments_viral = np.random.normal(loc=25, scale=20, size=int(n_samples * 0.2))
shares_viral = np.random.normal(loc=15, scale=15, size=int(n_samples * 0.2))
time_viral = np.random.randint(0, 24, size=int(n_samples * 0.2))  
label_viral = np.ones(int(n_samples * 0.2))

# Ensure no negative metrics
likes = np.clip(np.concatenate([likes_norm, likes_viral]), 0, None)
comments = np.clip(np.concatenate([comments_norm, comments_viral]), 0, None)
shares = np.clip(np.concatenate([shares_norm, shares_viral]), 0, None)
posting_time = np.concatenate([time_norm, time_viral])
labels = np.concatenate([label_norm, label_viral])

X = np.column_stack((likes, comments, shares, posting_time))
y = labels

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest...")
rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
print(f"Random Forest Accuracy: {accuracy_score(y_test, rf_pred):.4f}")

print("Training Gradient Boosting...")
gb_model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
gb_model.fit(X_train, y_train)
gb_pred = gb_model.predict(X_test)
print(f"Gradient Boosting Accuracy: {accuracy_score(y_test, gb_pred):.4f}")

# Ensure models directory exists
models_dir = os.path.join(os.path.dirname(__file__), 'models')
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

rf_path = os.path.join(models_dir, 'rf_viral_model.pkl')
gb_path = os.path.join(models_dir, 'gb_viral_model.pkl')

joblib.dump(rf_model, rf_path)
joblib.dump(gb_model, gb_path)

print(f"Models saved successfully to:")
print(f" - {rf_path}")
print(f" - {gb_path}")
print("Training complete!")
