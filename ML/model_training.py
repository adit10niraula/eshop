import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import pickle

# Load the dataset
# data = pd.read_csv('D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/processed_data.csv')

data_path = 'processed_data.csv'

print("Loading processed_data.csv...")
data = pd.read_csv(data_path)

# Check interaction_weight distribution
print("Interaction weight distribution:")
print(data['interaction_weight'].value_counts())

# Define an alternative target variable based on recency
y = (data['recency'] < 30).astype(int).values  # Active if recency < 30 days

# Check class distribution in y
print("Class distribution in y:", pd.Series(y).value_counts())

# Ensure there are at least two classes
if len(pd.unique(y)) < 2:
    raise ValueError("The target variable y contains only one class. Logistic Regression requires at least two classes.")

# Define features (X)
X = data[['recency', 'interaction_weight']].values  # Adjust features as needed

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the logistic regression model
model = LogisticRegression(solver='lbfgs')

try:
    model.fit(X_train, y_train)
    print("Model trained successfully.")
    
    # Save the trained model
    with open('trained_model.pkl', 'wb') as model_file:
        pickle.dump(model, model_file)
    print("Trained model saved as 'trained_model.pkl'.")

    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy * 100:.2f}%")

except ValueError as e:
    print(f"Error: {e}")
