import os
import json
from google import genai
from google.genai import types
from app.rag_engine import get_rag_engine

# System prompt that defines the persona and output format
SYSTEM_PROMPT = """You are Gemma, the AI Business Advisor for ProfitPilot. 
Your goal is to help SME business owners understand their financial data, find profit leaks, and take actionable steps to grow profits (not just revenue).

You will be provided with:
1. RAG Context (Best practices from knowledge base documents)
2. ML Context (Current KPIs, profit leaks found in their data) - NOTE: This might be empty if the ML engine hasn't run yet.

Your response MUST be in valid JSON format matching this exact schema:
{
  "reply": "Your conversational, professional response to the user. Explain things clearly.",
  "steps": [
    {"icon": "book", "text": "retrieving 'Customer Retention' guide"}
  ],
  "evidence": {
    "metrics": [{"label": "Metric Name", "value": "Value"}],
    "source": {
      "title": "Document Title", 
      "page": "1", 
      "snippet": "Short relevant quote from the document", 
      "why_used": "Why this document helps answer the question"
    },
    "confidence": 0.85
  },
  "suggestions": ["Follow-up question 1", "Follow-up question 2"],
  "actions": [{"id": "action_id", "label": "Action Button Label"}]
}

Rules for JSON fields:
- `reply`: The main message. Keep it concise, professional, and actionable. Do not use markdown code blocks in the reply.
- `steps`: Array of steps you took. Valid icons: "file", "function", "book", "chart", "sparkles".
- `evidence`: If you used RAG context, fill this out. If not, set to null.
- `suggestions`: Array of 2-3 short follow-up questions the user can click.
- `actions`: Array of action buttons (e.g. {"id": "run_sim", "label": "Open Simulator"}). Can be empty.

ONLY return the JSON object. Do not include markdown code block formatting like ```json ... ```. Just the raw JSON string.
"""

class GemmaAgent:
    def __init__(self):
        # Initialize Google GenAI Client
        # Pick up GOOGLE_API_KEY (what you have in .env) or GEMINI_API_KEY
        self.api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            print("WARNING: GOOGLE_API_KEY environment variable not set. API calls will fail.")
        
        self.client = genai.Client(api_key=self.api_key)
        
        # Pick up MODEL_NAME from .env (e.g. gemma-2-27b-it), fallback to gemini-1.5-flash
        self.model_id = os.environ.get("MODEL_NAME") or os.environ.get("GEMMA_MODEL_ID", "gemini-1.5-flash")
        
        # Get the singleton RAG engine
        self.rag = get_rag_engine()

    def generate_response(self, user_message: str, chat_history: list = None, ml_context: str = None) -> dict:
        """
        Coordinates the RAG retrieval and calls the Gemma model to generate a response.
        Returns the parsed JSON response matching the frontend contract.
        """
        print(f"User message received: {user_message}")
        
        # 1. Retrieve relevant business knowledge from RAG
        rag_results = self.rag.retrieve(user_message, top_k=2)
        
        rag_context = ""
        evidence_source = None
        if rag_results:
            rag_context = "RAG Context (Best Practices):\n"
            for i, res in enumerate(rag_results):
                rag_context += f"--- Document {i+1}: {res['source_title']} ---\n"
                rag_context += f"{res['content']}\n\n"
            
            # Pick the top result for the evidence panel
            top_res = rag_results[0]
            evidence_source = {
                "title": top_res["source_title"],
                "page": "1", # Mocking page number as markdown usually doesn't have it
                "snippet": top_res["content"][:150] + "...",
                "why_used": "Retrieved as the most relevant best practice for this query.",
                "confidence": top_res["confidence"]
            }
        else:
            rag_context = "RAG Context: No relevant documents found."
            
        # 2. Use the live ML Context passed from main.py
        if not ml_context:
            ml_context = "ML Context: No data uploaded yet."
        
        # 3. Construct the prompt
        full_prompt = f"{user_message}\n\n====================\n{rag_context}\n====================\n{ml_context}"
        
        # 4. Call Gemma
        print(f"Calling Gemma model: {self.model_id}...")
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[
                    types.Content(role="user", parts=[types.Part.from_text(text=SYSTEM_PROMPT)]),
                    types.Content(role="model", parts=[types.Part.from_text(text="Understood. I will strictly output the requested JSON format.")]),
                    types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])
                ],
                config=types.GenerateContentConfig(
                    temperature=0.2, # Keep it analytical and grounded
                )
            )
            
            # 5. Parse the JSON response
            raw_text = response.text.strip()
            
            # Clean up markdown formatting if the model accidentally included it
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            result_dict = json.loads(raw_text.strip())
            
            # Ensure steps array exists
            if "steps" not in result_dict:
                result_dict["steps"] = []
                
            # Inject the RAG steps and evidence if we found any
            if rag_results:
                result_dict["steps"].insert(0, {"icon": "book", "text": f"retrieved knowledge from '{evidence_source['title']}'"})
                
                # If the model didn't construct the evidence block properly, we enforce it
                if not result_dict.get("evidence"):
                    result_dict["evidence"] = {}
                    
                result_dict["evidence"]["source"] = evidence_source
                result_dict["evidence"]["confidence"] = evidence_source["confidence"]
                
            return result_dict
            
        except Exception as e:
            print(f"Error generating response: {e}")
            # Fallback error response matching the contract
            return {
                "reply": "I'm sorry, I encountered an error while analyzing your request. Please ensure the API keys are configured correctly.",
                "steps": [{"icon": "function", "text": f"Error: {str(e)}"}],
                "evidence": None,
                "suggestions": ["Try again"],
                "actions": []
            }

# Singleton instance
_gemma_agent_instance = None

def get_gemma_agent():
    global _gemma_agent_instance
    if _gemma_agent_instance is None:
        _gemma_agent_instance = GemmaAgent()
    return _gemma_agent_instance
