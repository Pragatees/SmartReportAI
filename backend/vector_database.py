import json
import logging
import os
import pickle
import numpy as np
import faiss
import requests
from threading import Lock
from fastapi import APIRouter, HTTPException
from sentence_transformers import SentenceTransformer
from models import VectorStoreInput, QueryInput
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Vector Database"])  # Removed prefix="/vector-db"

# Thread lock for vector database operations
vector_db_lock = Lock()

# Vector database file paths
DATA_DIR = "data"
VECTOR_DB_PATH = os.path.join(DATA_DIR, "vector_db.pkl")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index.bin")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Replace with your actual Perplexity API key
PERPLEXITY_API_KEY = "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"
HEADERS = {
    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
    "Content-Type": "application/json"
}
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

class VectorDatabase:
    """Improved vector database class with proper state management"""
    
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = faiss.IndexFlatL2(dimension)
        self.stored_data = []
        self.load_database()
    
    def save_database(self):
        """Save the vector database to disk"""
        try:
            faiss.write_index(self.index, FAISS_INDEX_PATH)
            with open(VECTOR_DB_PATH, 'wb') as f:
                pickle.dump(self.stored_data, f)
            logger.info(f"Saved vector database with {len(self.stored_data)} items")
        except Exception as e:
            logger.error(f"Error saving database: {str(e)}")
            raise
    
    def load_database(self):
        """Load the vector database from disk"""
        try:
            if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(VECTOR_DB_PATH):
                self.index = faiss.read_index(FAISS_INDEX_PATH)
                with open(VECTOR_DB_PATH, 'rb') as f:
                    self.stored_data = pickle.load(f)
                logger.info(f"Loaded vector database with {len(self.stored_data)} items")
            else:
                logger.info("No existing database found, starting fresh")
        except Exception as e:
            logger.error(f"Error loading database: {str(e)}")
            self.index = faiss.IndexFlatL2(self.dimension)
            self.stored_data = []
    
    def add_vectors(self, texts_with_metadata: List[tuple]) -> bool:
        """Add vectors to the database with proper error handling"""
        try:
            if not texts_with_metadata:
                return False
            
            texts = [text for text, _ in texts_with_metadata]
            embeddings = self.model.encode(texts)
            embeddings = np.array(embeddings).astype('float32')
            
            if embeddings.shape[1] != self.dimension:
                raise ValueError(f"Embedding dimension mismatch: expected {self.dimension}, got {embeddings.shape[1]}")
            
            self.index.add(embeddings)
            for _, metadata in texts_with_metadata:
                self.stored_data.append(metadata)
            
            if self.index.ntotal != len(self.stored_data):
                logger.error(f"Index and metadata out of sync: {self.index.ntotal} vs {len(self.stored_data)}")
                return False
            
            self.save_database()
            logger.info(f"Added {len(texts_with_metadata)} vectors to database")
            return True
            
        except Exception as e:
            logger.error(f"Error adding vectors: {str(e)}")
            return False
    
    def query_vectors(self, query_text: str, k: int = 5, distance_threshold: float = 2.0) -> Dict[str, Any]:
        """Query vectors with improved error handling and results"""
        try:
            if not query_text.strip():
                return {"results": [], "message": "Query cannot be empty"}
            
            if self.index.ntotal == 0:
                return {"results": [], "message": "No data available in the vector database"}
            
            query_embedding = self.model.encode([query_text]).astype('float32')
            actual_k = min(k, self.index.ntotal)
            distances, indices = self.index.search(query_embedding, actual_k)
            
            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if 0 <= idx < len(self.stored_data):
                    results.append({
                        "content": self.stored_data[idx],
                        "distance": float(distance),
                        "similarity_score": 1.0 / (1.0 + float(distance))
                    })
            
            results.sort(key=lambda x: x["distance"])
            filtered_results = [r for r in results if r["distance"] <= distance_threshold]
            
            if not filtered_results:
                return {
                    "results": [], 
                    "message": f"No relevant results found within similarity threshold (distance <= {distance_threshold})",
                    "total_vectors": self.index.ntotal,
                    "searched_vectors": actual_k
                }
            
            return {
                "results": filtered_results,
                "message": f"Found {len(filtered_results)} relevant results",
                "total_vectors": self.index.ntotal,
                "searched_vectors": actual_k
            }
            
        except Exception as e:
            logger.error(f"Error querying vectors: {str(e)}")
            return {"results": [], "message": f"Error during query: {str(e)}"}

# Initialize global vector database
vector_db = VectorDatabase()

def call_perplexity_api(prompt: str) -> str:
    """Call the Perplexity API with the given prompt"""
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    try:
        response = requests.post(PERPLEXITY_API_URL, headers=HEADERS, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Perplexity API error: {response.text}"
            )
        response_json = response.json()
        content = response_json.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content:
            raise HTTPException(status_code=500, detail="Empty response from Perplexity API")
        return content
    except Exception as e:
        logger.error(f"Perplexity API call failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Perplexity API call failed: {str(e)}")

def safe_json_parse(message_content: str) -> Dict[str, Any]:
    """Safely parse JSON content from Perplexity API response"""
    try:
        json_start = message_content.find('{')
        json_end = message_content.rfind('}') + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No valid JSON object found in response")
        pure_json = message_content[json_start:json_end]
        return json.loads(pure_json)
    except (json.JSONDecodeError, ValueError) as je:
        logger.error(f"Invalid JSON response: {message_content}")
        logger.error(f"JSON decode error: {str(je)}")
        raise HTTPException(status_code=422, detail={
            "message": "Invalid JSON format in response",
            "original_response": message_content,
            "error": str(je)
        })

@router.post("/store-vector")
async def store_in_vector_db(input: VectorStoreInput):
    """Store data in the vector database"""
    try:
        with vector_db_lock:
            texts_to_vectorize = []
            
            texts_to_vectorize.append((
                input.text[:1000],
                {
                    "type": "input_text", 
                    "content": input.text,
                    "timestamp": str(np.datetime64('now'))
                }
            ))
            
            if input.domain_result and 'reason' in input.domain_result:
                texts_to_vectorize.append((
                    input.domain_result['reason'], 
                    {
                        "type": "domain_reason", 
                        "content": input.domain_result,
                        "timestamp": str(np.datetime64('now'))
                    }
                ))
            
            if input.insights_result and 'domain_summary' in input.insights_result:
                texts_to_vectorize.append((
                    input.insights_result['domain_summary'], 
                    {
                        "type": "summary", 
                        "content": input.insights_result['domain_summary'],
                        "timestamp": str(np.datetime64('now'))
                    }
                ))
            
            if input.insights_result and 'detailed_insights' in input.insights_result:
                for i, insight in enumerate(input.insights_result['detailed_insights']):
                    if isinstance(insight, dict) and 'description' in insight:
                        texts_to_vectorize.append((
                            insight['description'], 
                            {
                                "type": "insight", 
                                "content": insight,
                                "insight_index": i,
                                "timestamp": str(np.datetime64('now'))
                            }
                        ))
            
            for i, suggestion in enumerate(input.suggestions):
                if suggestion and isinstance(suggestion, str):
                    texts_to_vectorize.append((
                        suggestion, 
                        {
                            "type": "suggestion", 
                            "content": suggestion,
                            "suggestion_index": i,
                            "timestamp": str(np.datetime64('now'))
                        }
                    ))
            
            if not texts_to_vectorize:
                return {"message": "No valid data to store", "stored_count": 0}
            
            success = vector_db.add_vectors(texts_to_vectorize)
            
            if success:
                return {
                    "message": "Data stored successfully in vector database", 
                    "stored_count": len(texts_to_vectorize),
                    "total_vectors": vector_db.index.ntotal
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to store data in vector database")

    except Exception as e:
        logger.error(f"Error storing in vector database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store in vector database: {str(e)}")

@router.post("/query-vector")
async def query_vector_db(input: QueryInput):
    """Query the vector database and enhance with Perplexity API"""
    if not input.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        with vector_db_lock:
            query_result = vector_db.query_vectors(
                input.query, 
                k=input.k, 
                distance_threshold=input.distance_threshold
            )
            
            context_parts = []
            for result in query_result["results"]:
                content = result["content"]
                content_data = content.get("content", "")
                
                if content.get("type") == "input_text":
                    context_parts.append(str(content_data))
                elif content.get("type") == "domain_reason" and isinstance(content_data, dict) and 'reason' in content_data:
                    context_parts.append(content_data['reason'])
                elif content.get("type") == "summary":
                    context_parts.append(str(content_data))
                elif content.get("type") == "insight" and isinstance(content_data, dict) and 'description' in content_data:
                    context_parts.append(content_data['description'])
                elif content.get("type") == "suggestion":
                    context_parts.append(str(content_data))
            
            context_text = "\n".join(context_parts) if context_parts else "No relevant information found in the database."
            
            prompt = f"""
You are a helpful assistant. Based on the following context retrieved from a database, provide a concise, natural language answer to the user's query. Use the context to inform your response, but synthesize the information to answer the query accurately and coherently. If the context is insufficient or the query is ambiguous, explain that and suggest how the user can clarify it.

Query: {input.query}

Context:
{context_text}

Respond with a JSON object in this format:
{{
  "response": "Your natural language answer here based on the context"
}}
"""
            logger.debug(f"Sending prompt to Perplexity API: {prompt[:500]}...")
            
            message_content = call_perplexity_api(prompt)
            result = safe_json_parse(message_content)
            
            if not result.get("response") or not isinstance(result["response"], str):
                logger.error(f"Invalid Perplexity response: {result}")
                raise HTTPException(status_code=500, detail="Invalid or missing 'response' field in Perplexity API response")
            
            logger.info(f"Generated response for query '{input.query}': {result['response'][:200]}...")
            
            return {
                "response": result["response"].strip(),
                "retrieved_context": query_result["results"][:input.k],
                "query_info": {
                    "total_vectors": query_result.get("total_vectors", 0),
                    "results_found": len(query_result["results"]),
                    "distance_threshold": input.distance_threshold
                }
            }

    except Exception as e:
        logger.error(f"Error querying vector database: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to query vector database: {str(e)}")

@router.get("/vector-db-stats")
async def get_vector_db_stats():
    """Get statistics about the vector database"""
    try:
        with vector_db_lock:
            stats = {
                "total_vectors": vector_db.index.ntotal,
                "stored_metadata_count": len(vector_db.stored_data),
                "dimension": vector_db.dimension,
                "is_synchronized": vector_db.index.ntotal == len(vector_db.stored_data)
            }
            
            type_counts = {}
            for metadata in vector_db.stored_data:
                content_type = metadata.get("type", "unknown")
                type_counts[content_type] = type_counts.get(content_type, 0) + 1
            
            stats["content_type_distribution"] = type_counts
            return stats
            
    except Exception as e:
        logger.error(f"Error getting vector DB stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get vector database statistics: {str(e)}")

@router.delete("/clear-vector-db")
async def clear_vector_db():
    """Clear all data from the vector database"""
    try:
        with vector_db_lock:
            vector_db.index = faiss.IndexFlatL2(vector_db.dimension)
            vector_db.stored_data = []
            
            if os.path.exists(FAISS_INDEX_PATH):
                os.remove(FAISS_INDEX_PATH)
            if os.path.exists(VECTOR_DB_PATH):
                os.remove(VECTOR_DB_PATH)
            
            logger.info("Vector database cleared successfully")
            return {"message": "Vector database cleared successfully"}
            
    except Exception as e:
        logger.error(f"Error clearing vector database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear vector database: {str(e)}")