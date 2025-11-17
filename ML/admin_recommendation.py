import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict
from flask_pymongo import PyMongo

# Assuming we already have the MongoDB instance initiated
mongo = PyMongo()

# Interaction weights
interaction_weights = {
    'viewed_product': 1,
    'added_to_cart': 2,
    'purchased': 3,
    'added_to_wishlist': 1.5
}

def fetch_interaction_data():
    interactions = list(mongo.db.userinteractions.find({}))
    df = pd.DataFrame(interactions)
    return df

def calculate_product_trends(df):
    # Map interaction weights
    df['interaction_weight'] = df['eventType'].map(interaction_weights)
    
    # Convert timestamps to datetime
    df['event_time'] = pd.to_datetime(df['timestamp'])
    
    # Add time-based features for trend analysis
    df['week'] = df['event_time'].dt.to_period('W')
    df['month'] = df['event_time'].dt.to_period('M')

    # Aggregate data by product_id and week/month
    trend_data = df.groupby(['productId', 'month']).agg({
        'interaction_weight': 'sum',
        'event_time': 'count'
    }).rename(columns={'event_time': 'interaction_count'}).reset_index()
    
    # Calculate average score per interaction
    trend_data['avg_interaction_score'] = trend_data['interaction_weight'] / trend_data['interaction_count']
    return trend_data

def generate_insights(trend_data):
    insights = []
    for _, row in trend_data.iterrows():
        product_id = row['productId']
        interaction_count = row['interaction_count']
        avg_score = row['avg_interaction_score']
        
        # Simple heuristic to generate recommendation
        if avg_score > 2 and interaction_count > 100:
            insights.append(f"Product {product_id} has high demand and frequent interactions. Consider restocking or promotions.")
        elif interaction_count > 50:
            insights.append(f"Product {product_id} has moderate demand. Sales might increase with targeted discounts.")
        else:
            insights.append(f"Product {product_id} has low interaction; consider seasonal adjustments.")
    
    return insights
