import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import pickle

def train_seller_model():
    try:
        # Load the preprocessed data
        data_path = 'processed_sales_data.csv'
        data = pd.read_csv(data_path)
        print(f"Loaded dataset from {data_path}")

        # Check if required columns are present
        required_columns = ['recency', 'interaction_weight']
        for col in required_columns:
            if col not in data.columns:
                raise KeyError(f"Column '{col}' is missing from the dataset. Please verify the preprocessed data.")

        # Inspect recency distribution
        print("Recency column distribution:")
        print(data['recency'].describe())
        print(data['recency'].value_counts())

        # Adjust the threshold to ensure at least two classes
        threshold = 5  # Lower threshold to introduce inactive sellers
        y = (data['recency'] < threshold).astype(int).values

        # Check class distribution in the target variable
        print(f"Class distribution in the target variable y (Threshold: {threshold}):")
        print(pd.Series(y).value_counts())

        # Ensure there are at least two classes
        if len(pd.unique(y)) < 2:
            raise ValueError("The target variable y contains only one class. Logistic Regression requires at least two classes.")

        # Define features (X)
        X = data[['recency', 'interaction_weight']].values

        # Split the dataset into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        print(f"Training data: {X_train.shape}, Testing data: {X_test.shape}")

        # Train the logistic regression model
        model = LogisticRegression(solver='lbfgs', max_iter=1000)

        # Fit the model
        model.fit(X_train, y_train)
        print("Model trained successfully.")

        # Save the trained model
        model_path = 'seller_trained_model.pkl'
        with open(model_path, 'wb') as model_file:
            pickle.dump(model, model_file)
        print(f"Trained model saved as '{model_path}'.")

        # Evaluate the model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Accuracy: {accuracy * 100:.2f}%")
        print("Classification Report:\n", classification_report(y_test, y_pred))

    except FileNotFoundError:
        print(f"Error: The file '{data_path}' was not found. Ensure that the preprocessing step was completed successfully.")
    except KeyError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == '__main__':
    train_seller_model()
