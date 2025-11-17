import pandas as pd

def preprocess_sales_data():
    # Load dataset
    file_path = 'D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/datasets/SalesDataAnalysis.csv'
    df = pd.read_csv(file_path)

    print("Dataset loaded successfully!")
    print("Columns in the dataset:")
    print(df.columns)  # Print all column names for debugging

    print("Processing............")
    print(f"Total rows in dataset: {len(df)}")

    # Define interaction weights based on sales volume
    df['interaction_weight'] = df['Sales']  # Assuming higher sales indicate stronger interactions

    # Convert 'Order Date' to datetime
    if 'Order Date' not in df.columns:
        raise KeyError("'Order Date' column is missing from the dataset. Please verify the dataset.")
    df['Order Date'] = pd.to_datetime(df['Order Date'], errors='coerce')

    # Calculate recency (in days)
    df['recency'] = (df['Order Date'].max() - df['Order Date']).dt.days

    # Group by 'Product' and 'City' to aggregate features
    grouped_df = df.groupby(['Product', 'City']).agg({
        'interaction_weight': 'sum',
        'recency': 'min',
        'Quantity Ordered': 'sum'
    }).reset_index()

    print(f"Processed rows in grouped dataset: {len(grouped_df)}")
    return grouped_df

# Save preprocessed data for training
if __name__ == '__main__':
    try:
        processed_data = preprocess_sales_data()
        processed_data.to_csv('processed_sales_data.csv', index=False)
        print("Data preprocessing completed and saved to processed_sales_data.csv")
    except KeyError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
