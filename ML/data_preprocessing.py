import pandas as pd
import os

def preprocess_datasets():
    # Load datasets
    # df1 = pd.read_csv('D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/datasets/2019-Dec.csv')
    # df2 = pd.read_csv('D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/datasets/2019-Nov.csv')
    # df3 = pd.read_csv('D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/datasets/2019-Oct.csv')
    # df4 = pd.read_csv('D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/datasets/2020-Feb.csv')
    # df5 = pd.read_csv('D:/Web Dev/MERN projects/ParasharShop/ParasharShop/ML/datasets/2020-Jan.csv')

    # # Combine datasets
    # df = pd.concat([df1, df2, df3, df4, df5], ignore_index=True)

    base_path = os.path.dirname(__file__)  # Gets directory of current script
    dataset_path = os.path.join(base_path, "datasets")
    df = pd.read_csv(os.path.join(dataset_path, 'data_processing_test.csv'))

    print("Processing............")
    print(f"Total rows in combined dataset: {len(df)}")

    # Define interaction weights
    interaction_weights = {
        'viewed_product': 1,
        'added_to_cart': 2,
        'purchased': 3,
        'added_to_wishlist': 1.5
    }

    # Map interaction weights
    df['interaction_weight'] = df['event_type'].map(interaction_weights)

    # Convert event_time to datetime
    df['event_time'] = pd.to_datetime(df['event_time'])

    # Calculate recency (in days)
    df['recency'] = (df['event_time'].max() - df['event_time']).dt.days

    # Group by user_id and product_id to aggregate features
    df_grouped = df.groupby(['user_id', 'product_id']).agg({
        'interaction_weight': 'sum',
        'recency': 'min'
    }).reset_index()

    print(f"Processed rows in grouped dataset: {len(df_grouped)}")
    return df_grouped

# Save preprocessed data for training
if __name__ == '__main__':
    processed_data = preprocess_datasets()
    processed_data.to_csv('processed_data.csv', index=False)
    print("Data preprocessing completed and saved to processed_data.csv")
