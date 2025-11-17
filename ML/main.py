from flask import Flask, jsonify
from flask_pymongo import PyMongo
from bson import ObjectId
from collections import defaultdict
from datetime import datetime
import numpy as np
import pickle
from bson import json_util
import json
import pandas as pd
import random
import math

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/ParasharShop"
mongo = PyMongo(app)

# Load the trained ML model
with open('seller_trained_model.pkl', 'rb') as model_file:
    ml_model = pickle.load(model_file)

with open('trained_model.pkl', 'rb') as model_file:
    ml_user_model = pickle.load(model_file)

# Define interaction weights
interaction_weights = {
    'viewed_product': 1,
    'added_to_cart': 2,
    'purchased': 3,
    'added_to_wishlist': 1.5
}


MESSAGE_TEMPLATES = {
    "high_demand": [
        "Product {name} is consistently popular with {total_interactions} interactions. Recommend maintaining or increasing stock.",
        "Consider promotional support for {name}, which has a strong engagement score of {avg_score}.",
    ],
    "growing_demand": [
        "Product {name} is gaining traction, showing a {recent_trend} trend. Consider enhancing visibility to meet demand.",
        "{name} is experiencing an uptick in interactions. Might be a good time for promotions or special offers.",
    ],
    "stable_demand": [
        "{name} shows steady demand, with {total_interactions} interactions over time. Keep stock levels stable and consider seasonal promos.",
        "Demand for {name} is consistent. Maintain current inventory and watch for trend changes.",
    ],
    "low_demand": [
        "{name} has low engagement. Consider discounting or repositioning to attract interest.",
        "{name} shows limited interest with only {total_interactions} interactions. Assess for potential marketing or bundling opportunities.",
    ],
}

# Helper functions for custom TF-IDF and Cosine Similarity
def calculate_tf(doc):
    """Calculate term frequency for a single document."""
    tf = {}
    words = doc.split()
    total_words = len(words)
    for word in words:
        tf[word] = tf.get(word, 0) + 1
    for word in tf:
        tf[word] = tf[word] / total_words
    return tf

def calculate_idf(docs):
    """Calculate inverse document frequency for all terms in the corpus."""
    idf = {}
    total_docs = len(docs)
    for doc in docs:
        words = set(doc.split())
        for word in words:
            idf[word] = idf.get(word, 0) + 1
    for word in idf:
        idf[word] = math.log(total_docs / (idf[word] + 1))  
    return idf

def calculate_tf_idf(docs):
    """Calculate TF-IDF vectors for all documents."""
    tf_idf_vectors = []
    idf = calculate_idf(docs)
    for doc in docs:
        tf = calculate_tf(doc)
        tf_idf = {word: tf[word] * idf[word] for word in tf}
        tf_idf_vectors.append(tf_idf)
    return tf_idf_vectors

def cosine_similarity(vec1, vec2):
    """Calculate cosine similarity between two vectors."""
    all_words = set(vec1.keys()).union(set(vec2.keys()))
    v1 = np.array([vec1.get(word, 0) for word in all_words])
    v2 = np.array([vec2.get(word, 0) for word in all_words])
    dot_product = np.dot(v1, v2)
    magnitude_v1 = np.linalg.norm(v1)
    magnitude_v2 = np.linalg.norm(v2)
    if magnitude_v1 == 0 or magnitude_v2 == 0:
        return 0.0
    return dot_product / (magnitude_v1 * magnitude_v2)

def convert_object_id(id_value):
    """Helper function to convert various ID formats to ObjectId."""
    if isinstance(id_value, dict) and '$oid' in id_value:
        return ObjectId(id_value['$oid'])
    elif isinstance(id_value, str):
        return ObjectId(id_value)
    elif isinstance(id_value, ObjectId):
        return id_value
    return None

def process_product_ids(product_ids):
    """Convert product IDs to a list of ObjectIds."""
    if isinstance(product_ids, list):
        return [convert_object_id(pid) for pid in product_ids if convert_object_id(pid)]
    else:
        converted_id = convert_object_id(product_ids)
        return [converted_id] if converted_id else []
def fetch_seller_interaction_data(seller_id):
    """Fetches user interactions and products associated with a specific seller."""
    
    # Convert seller ID to ObjectId if necessary
    seller_object_id = convert_object_id(seller_id)
    if not seller_object_id:
        raise ValueError("Invalid seller ID format.")
    
    # Fetch all products for this seller
    products = list(mongo.db.products.find({"seller": seller_object_id, "deleted": False}))
    
    # If no products found for this seller, return an empty DataFrame and empty product list
    if not products:
        return pd.DataFrame(), []

    # Extract product IDs as a list of ObjectId
    product_ids = [product['_id'] for product in products]
    
    # Query userInteractions for these specific product IDs
    interactions = list(mongo.db.userinteractions.find({"productId": {"$in": product_ids}}))
    
    # If no interactions found, return an empty DataFrame and the product list
    if not interactions:
        return pd.DataFrame(), products

    # Convert interactions to DataFrame
    df = pd.DataFrame(interactions)

    # Ensure the timestamp column is converted to datetime format
    df['timestamp'] = pd.to_datetime(df['timestamp'].apply(lambda x: x['$date'] if isinstance(x, dict) else x))
    
    # Convert `productId` ObjectId values to strings and create a `normalized_product_ids` column
    df['productId'] = df['productId'].apply(lambda pid_list: str(pid_list[0]) if isinstance(pid_list, list) and pid_list else None)
    df['normalized_product_ids'] = df['productId']  # Duplicate column as `normalized_product_ids`

    return df, products


# Function to calculate trends based on interaction data
def calculate_product_trends(df, products_info):
    if df.empty:
        return pd.DataFrame()
    
    # Explode the normalized_product_ids to create a row for each product-interaction combination
    df_exploded = df.explode('normalized_product_ids').reset_index(drop=True)
    
    # Calculate weights and timestamps
    df_exploded['interaction_weight'] = df_exploded['eventType'].map(interaction_weights)
    df_exploded['event_time'] = pd.to_datetime(df_exploded['timestamp'])
    df_exploded['month'] = df_exploded['event_time'].dt.to_period('M')
    
    # Group by product and month
    trend_data = df_exploded.groupby(['normalized_product_ids', 'month']).agg({
        'interaction_weight': 'sum',
        'event_time': 'count'
    }).rename(columns={'event_time': 'interaction_count'}).reset_index()
    
    # Calculate average interaction score
    trend_data['avg_interaction_score'] = trend_data['interaction_weight'] / trend_data['interaction_count']
    
    # Convert ObjectId to string for JSON serialization
    trend_data['product_id'] = trend_data['normalized_product_ids'].apply(str)
    
    # Calculate the interaction trend by comparing with the previous month
    trend_data = trend_data.sort_values(by=['product_id', 'month'])  # Sort by product_id and month
    trend_data['previous_month_interaction'] = trend_data.groupby('product_id')['interaction_count'].shift(1)
    trend_data['interaction_trend'] = trend_data.apply(
        lambda row: "1" if row['interaction_count'] > row['previous_month_interaction']
        else "-1" if row['interaction_count'] < row['previous_month_interaction']
        else "0",
        axis=1
    )
    
    # Convert Period to string for JSON serialization
    trend_data['month'] = trend_data['month'].astype(str)
    
    # Drop unnecessary columns and ensure all numeric values are float
    trend_data = trend_data.drop(['normalized_product_ids', 'previous_month_interaction'], axis=1)
    trend_data['interaction_weight'] = trend_data['interaction_weight'].astype(float)
    trend_data['interaction_count'] = trend_data['interaction_count'].astype(float)
    trend_data['avg_interaction_score'] = trend_data['avg_interaction_score'].astype(float)
    
    # Convert products_info to DataFrame and merge with trend_data to include name and thumbnail
    products_df = pd.DataFrame(products_info)
    products_df['_id'] = products_df['_id'].astype(str)
    trend_data = trend_data.merge(products_df[['title', 'thumbnail', '_id']], left_on='product_id', right_on='_id', how='left')
    
    return trend_data.drop('_id', axis=1)

# Function to generate insights based on trends
def generate_insights(trend_data, products_info):
    if trend_data.empty:
        return []
    
    insights = []
    for product_id, group in trend_data.groupby('product_id'):
        product_info = next((p for p in products_info if str(p['_id']) == product_id), None)
        if not product_info:
            continue
            
        # Gather product metrics
        total_interactions = group['interaction_count'].sum()
        avg_score = group['avg_interaction_score'].mean()
        recent_trend = group['interaction_trend'].iloc[-1]  # Most recent trend
        product_name = product_info.get('title', f'Product {product_id}')
        product_thumbnail = product_info.get('thumbnail', '')

        # Determine message type based on metrics
        if avg_score > 1.5 and total_interactions > 20:
            message_type = "high_demand" if recent_trend != "-1" else "stable_demand"
        elif recent_trend == "1":
            message_type = "growing_demand"
        elif total_interactions < 5:
            message_type = "low_demand"
        else:
            message_type = "stable_demand"

        # Randomly choose a template and fill in the metrics
        message_template = random.choice(MESSAGE_TEMPLATES[message_type])
        message = message_template.format(
            name=product_name,
            total_interactions=total_interactions,
            avg_score=avg_score,
            recent_trend="rising" if recent_trend == "1" else "stable" if recent_trend == "0" else "falling",
        )
        
        print(product_thumbnail)
        # Append insight with dynamic message
        insights.append({
            "product_id": product_id,
            "product_name": product_name,
            "thumbnail": product_thumbnail,
            "type": message_type,
            "message": message
        })

    return insights

# Seller trends endpoint
@app.route('/seller-insights/<seller_id>', methods=['GET'])
def seller_trends(seller_id):
    try:
        # Fetch interactions and products for the seller's products
        interactions_data = fetch_seller_interaction_data(seller_id)
        
        # Unpack the tuple into interactions_df and products
        interactions_df, products = interactions_data

        # Check if interactions_df is empty
        if interactions_df.empty:
            return jsonify({
                "insights": [],
                "trend_data": [],
                "message": "No interactions found for this seller's products."
            })

        # Calculate current trends and generate insights
        trend_data = calculate_product_trends(interactions_df, products)
        insights = generate_insights(trend_data, products)

        # Prepare response
        response = {
            "trend_data": trend_data.to_dict(orient="records") if not trend_data.empty else [],
            "insights": insights,
            "product_count": len(products),
            "total_interactions": len(interactions_df) if not interactions_df.empty else 0
        }

        return json.loads(json_util.dumps(response))

    except Exception as e:
        print(f"Error in seller_trends: {str(e)}")
        return jsonify({"error": "An internal error occurred", "message": str(e)}), 500


@app.route('/recommend/<user_id>', methods=['GET'])
def recommend_products(user_id):
    try:
        user_object_id = convert_object_id(user_id)
        if not user_object_id:
            return jsonify({"error": "Invalid user ID format"}), 400

        user_interactions = list(mongo.db.userinteractions.find({"userId": user_object_id}).sort("timestamp", -1))
        if not user_interactions:
            return jsonify({"message": "No interactions found for this user"}), 200

        product_scores = defaultdict(float)
        current_time = datetime.utcnow()

        RECENT_THRESHOLD_HOURS = 48
        for interaction in user_interactions:
            product_ids = process_product_ids(interaction['productId'])
            interaction_type = interaction['eventType']
            timestamp = interaction['timestamp']

            if isinstance(timestamp, dict):
                timestamp = timestamp.get('$date')

            interaction_time = datetime.fromisoformat(timestamp) if isinstance(timestamp, str) else timestamp
            time_diff_hours = (current_time - interaction_time).total_seconds() / 3600

            recency_weight = max(1, RECENT_THRESHOLD_HOURS - time_diff_hours) / RECENT_THRESHOLD_HOURS
            interaction_weight = interaction_weights.get(interaction_type, 1)

            for product_id in product_ids:
                product_scores[str(product_id)] += interaction_weight * recency_weight

        recommended_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_product_ids = [ObjectId(product_id) for product_id, _ in recommended_products]

        product_details = mongo.db.products.find({"_id": {"$in": recommended_product_ids}, "deleted": False})

        recommendations = []
        for product in product_details:
            product_id_str = str(product['_id'])
            score = dict(recommended_products).get(product_id_str, 0)
            recommendations.append({
                "product": product,
                "score": score
            })

        return json.loads(json_util.dumps(recommendations))

    except Exception as e:
        print(f"Error in recommend_products: {str(e)}")
        return jsonify({"error": "An internal error occurred", "message": str(e)}), 500

@app.route('/ml-recommendation/<user_id>', methods=['GET'])
def ml_recommendation(user_id):
    try:
        user_object_id = convert_object_id(user_id)
        if not user_object_id:
            return jsonify({"error": "Invalid user ID format"}), 400

        user_interactions = list(
            mongo.db.userinteractions.find({"userId": user_object_id}).sort("timestamp", -1)
        )
        
        all_products = list(mongo.db.products.find({"deleted": False}))
        if not all_products:
            return jsonify({"error": "No products found in the database"}), 404

        product_titles = [
            f"{product['title']} {product['description']} {' '.join(product.get('keywords', []))}"
            for product in all_products
        ]

        tf_idf_vectors = calculate_tf_idf(product_titles)

        interacted_product_ids = set()
        current_time = datetime.utcnow()
        RECENT_THRESHOLD_HOURS = 48
        recent_interactions = []

        for interaction in user_interactions:
            product_ids = process_product_ids(interaction.get('productId', []))
            timestamp = interaction['timestamp']

            if isinstance(timestamp, dict):
                timestamp = timestamp.get('$date')

            interaction_time = datetime.fromisoformat(timestamp) if isinstance(timestamp, str) else timestamp
            time_diff_hours = (current_time - interaction_time).total_seconds() / 3600

            if time_diff_hours <= RECENT_THRESHOLD_HOURS:
                recent_interactions.append(interaction)

            interacted_product_ids.update(str(pid) for pid in product_ids)

        if not recent_interactions:
            print("No recent interactions found. Falling back to older interactions.")

        interacted_indices = [
            i for i, product in enumerate(all_products)
            if str(product['_id']) in interacted_product_ids
        ]

        if not interacted_indices:
            fallback_recommendations = random.sample(all_products, min(5, len(all_products)))
            recommendations = [
                {"product": product, "similarity_score": 0.0} for product in fallback_recommendations
            ]
            return json.loads(json_util.dumps(recommendations))

        recommended_products = []
        for idx in interacted_indices:
            for i, tf_idf_vector in enumerate(tf_idf_vectors):
                if i != idx:
                    similarity_score = cosine_similarity(tf_idf_vectors[idx], tf_idf_vector)
                    if similarity_score > 0.04:
                        recommended_products.append({
                            "product": all_products[i],
                            "similarity_score": similarity_score
                        })

        unique_recommendations = {str(item['product']['_id']): item for item in recommended_products}
        recommendations = sorted(unique_recommendations.values(), key=lambda x: -x['similarity_score'])[:10]

        return json.loads(json_util.dumps(recommendations))

    except Exception as e:
        print(f"Error in ml_recommendation: {str(e)}")
        return jsonify({"error": "An internal error occurred", "message": str(e)}), 500



@app.route('/ml-recommendation-new/<user_id>', methods=['GET'])
def ml_recommendation_new(user_id):
    try:
        user_object_id = convert_object_id(user_id)
        if not user_object_id:
            return jsonify({"error": "Invalid user ID format"}), 400

        # Fetch user interactions with debug logging
        user_interactions = list(mongo.db.userinteractions.find({"userId": user_object_id}).sort("timestamp", -1))
        print(f"Found {len(user_interactions)} interactions for user {user_id}")

        # If no interactions, provide random recommendations instead of early return
        if not user_interactions:
            all_products = list(mongo.db.products.find({"deleted": False}).limit(5))
            random_recommendations = [
                {"product": product, "score": 0.5} 
                for product in all_products
            ]
            print("No interactions found, returning random recommendations")
            return json.loads(json_util.dumps(random_recommendations))

        # Fetch all products
        all_products = list(mongo.db.products.find({"deleted": False}))
        if not all_products:
            return jsonify({"error": "No products found in the database"}), 404

        # Prepare features for the ML model
        interaction_data = []
        product_ids = []
        current_time = datetime.utcnow()

        for interaction in user_interactions:
            product_id_list = process_product_ids(interaction.get('productId', []))
            if not product_id_list:  # Skip if no valid product IDs
                continue
                
            interaction_type = interaction.get('eventType', 'viewed_product')
            timestamp = interaction.get('timestamp')

            if isinstance(timestamp, dict):
                timestamp = timestamp.get('$date')

            interaction_time = datetime.fromisoformat(timestamp) if isinstance(timestamp, str) else timestamp
            time_diff_hours = (current_time - interaction_time).total_seconds() / 3600

            for product_id in product_id_list:
                recency = max(1, 48 - time_diff_hours) / 48
                interaction_weight = interaction_weights.get(interaction_type, 1)
                interaction_data.append([recency, interaction_weight])
                product_ids.append(str(product_id))

        print(f"Processed {len(interaction_data)} valid interactions")

        # Check if we have valid interaction data
        if not interaction_data:
            all_products = list(mongo.db.products.find({"deleted": False}).limit(5))
            random_recommendations = [
                {"product": product, "score": 0.5} 
                for product in all_products
            ]
            print("No valid interactions for ML model, returning random recommendations")
            return json.loads(json_util.dumps(random_recommendations))

        # Predict product recommendations
        interaction_data = np.array(interaction_data)
        # Use the trained ML model to predict the probability of the user interacting with each product again
        predictions = ml_user_model.predict_proba(interaction_data)[:, 1] 

        # Aggregate predictions by product
        product_scores = defaultdict(float)
        for product_id, score in zip(product_ids, predictions):
            product_scores[product_id] += score

        # Sort products by scores
        recommended_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_product_ids = [ObjectId(product_id) for product_id, _ in recommended_products]

        # Fetch product details
        product_details = mongo.db.products.find({"_id": {"$in": recommended_product_ids}, "deleted": False})

        # Prepare recommendations
        recommendations = []
        for product in product_details:
            product_id_str = str(product['_id'])
            score = product_scores.get(product_id_str, 0)
            recommendations.append({
                "product": product,
                "score": score
            })

        recommendations = sorted(recommendations, key=lambda x: -x['score'])
        print(f"Returning {len(recommendations)} recommendations")
        return json.loads(json_util.dumps(recommendations))

    except Exception as e:
        print(f"Error in ml_recommendation_new: {str(e)}")
        return jsonify({"error": "An internal error occurred", "message": str(e)}), 500


@app.route('/seller-insights-new/<seller_id>', methods=['GET'])
def seller_insights_new(seller_id):
    try:
        interactions_data = fetch_seller_interaction_data(seller_id)
        print(interactions_data)
        interactions_df, products = interactions_data

        # Check if interactions_df is empty
        if interactions_df.empty:
            return jsonify({
                "insights": [],
                "trend_data": [],
                "message": "No interactions found for this seller's products."
            })

        # Calculate current trends using the existing function
        trend_data = calculate_product_trends(interactions_df, products)

        # Prepare ML features for each product
        ml_features = []
        product_mapping = []
        current_time = datetime.utcnow()

        for product in products:
            product_id = str(product['_id'])
            product_interactions = interactions_df[interactions_df['productId'] == product_id]

            if not product_interactions.empty:
                # Calculate recency (in hours)
                timestamps = pd.to_datetime(product_interactions['timestamp'])
                most_recent_interaction = timestamps.max()
                hours_since_last_interaction = (current_time - most_recent_interaction).total_seconds() / 3600
                
                # Normalize recency to match training data scale (0-1)
                recency = max(0, min(1, hours_since_last_interaction / (30 * 24)))  # Normalize to 30 days
                
                # Calculate average interaction weight
                interaction_weight = product_interactions['eventType'].map(interaction_weights).mean()
                
                # Create feature vector matching the training data format
                features = [recency, interaction_weight]
                
                ml_features.append(features)
                product_mapping.append(product)

        if ml_features:
            # Use ML model to predict product performance
            ml_predictions = ml_model.predict_proba(np.array(ml_features))[:, 1]

            # Generate insights using ML predictions
            insights = []
            for idx, (product, prediction_score) in enumerate(zip(product_mapping, ml_predictions)):
                product_id = str(product['_id'])
                product_trend = trend_data[trend_data['product_id'] == product_id]
                
                # Determine message type based on ML prediction
                if prediction_score > 0.75:
                    message_type = "high_demand"
                elif prediction_score > 0.6:
                    message_type = "growing_demand"
                elif prediction_score > 0.4:
                    message_type = "stable_demand"
                else:
                    message_type = "low_demand"

                # Get product metrics
                total_interactions = product_trend['interaction_count'].sum() if not product_trend.empty else 0
                avg_score = product_trend['avg_interaction_score'].mean() if not product_trend.empty else 0
                recent_trend = product_trend['interaction_trend'].iloc[-1] if not product_trend.empty else "0"

                # Generate message
                message_template = random.choice(MESSAGE_TEMPLATES[message_type])
                message = message_template.format(
                    name=product['title'],
                    total_interactions=total_interactions,
                    avg_score=avg_score,
                    recent_trend="rising" if recent_trend == "1" else "stable" if recent_trend == "0" else "falling"
                )

                print(prediction_score)
                # Add ML prediction context
                engagement_level = (
                    "very high" if prediction_score > 1
                    else "high" if prediction_score > 0.8
                    else "moderate" if prediction_score > 0.2
                    else "low"
                )

                insights.append({
                    "product_id": product_id,
                    "product_name": product['title'],
                    "thumbnail": product.get('thumbnail', ''),
                    "type": message_type,
                    "message": message,
                    "ml_score": float(prediction_score),
                    "ml_features": {
                        "recency": float(ml_features[idx][0]),
                        "interaction_weight": float(ml_features[idx][1])
                    }
                })

            # Sort insights by ML prediction score
            insights = sorted(insights, key=lambda x: x['ml_score'], reverse=True)
        else:
            insights = []

        # Prepare response
        response = {
            "trend_data": trend_data.to_dict(orient="records") if not trend_data.empty else [],
            "insights": insights,
            "product_count": len(products),
            "total_interactions": len(interactions_df) if not interactions_df.empty else 0
        }

        return json.loads(json_util.dumps(response))

    except Exception as e:
        print(f"Error in seller_insights_new: {str(e)}")
        return jsonify({"error": "An internal error occurred", "message": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
