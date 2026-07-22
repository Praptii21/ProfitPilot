import os
import io
import json
import pandas as pd
import numpy as np
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler

from google import genai
from google.genai import types

from app.gemma_agent import get_gemma_agent
from app.rag_engine import get_rag_engine

# Load environment variables
load_dotenv()

app = FastAPI(title="ProfitPilot Core ML & Vision Engine + RAG Chat")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the GenAI Client for the ML engine's OCR
api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

GLOBAL_DATA = {"df": None}

# Initialize singletons on startup for RAG
@app.on_event("startup")
async def startup_event():
    print("Starting ProfitPilot Backend...")
    # This pre-loads the FAISS index and the Gemma model so requests are fast
    get_rag_engine()
    get_gemma_agent()


# --- SCHEMA DEFINITIONS FOR GEMMA VISION STRUCTURED OUTPUT ---
class ExtractedTransaction(BaseModel):
    transaction_date: str = Field(description="Date of the transaction in YYYY-MM-DD format. If only month/year is available, default to first day of the month.")
    customer_id: str = Field(description="Name or ID of the customer/client buying the goods.")
    product_name: str = Field(description="Name of the product or service sold.")
    quantity: int = Field(description="Number of units sold.")
    revenue: float = Field(description="Total gross revenue or sales amount before cost deduction.")
    cost: float = Field(description="Total cost of goods sold (COGS) for this transaction.")
    discount_percent: float = Field(description="Percentage discount applied to the transaction. Use 0 if none.")
    days_to_pay: int = Field(description="Number of days taken for the customer to settle the invoice payment.")

class InvoiceExtractionSchema(BaseModel):
    transactions: List[ExtractedTransaction]

class SimulationPayload(BaseModel):
    price_change_pct: float
    discount_change_pct: float
    payment_terms_days: int

# --- Pydantic Models for /chat ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


# --- HELPER FUNCTIONS ---
def calculate_health_score(margin: float, late_ratio: float, concentration: float) -> int:
    score = 50 + (margin * 2) - (late_ratio * 30) - (concentration * 20)
    return int(np.clip(score, 10, 100))

def run_ml_analysis(df: pd.DataFrame) -> dict:
    """Core ML & BI logic extracted into a reusable function so both /analyze and /extract can use it."""
    # Standardize column names to prevent KeyErrors from spaces or capitals
    df.columns = df.columns.str.strip().str.lower()
    
    # Ensure required columns exist to avoid cryptic Pandas errors later
    required = ['revenue', 'cost']
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Invalid CSV structure. Missing required columns: {missing}. Found: {list(df.columns)}")

    df.fillna(0, inplace=True)
    
    # Feature Engineering
    df['profit'] = df['revenue'] - df['cost']
    df['margin_pct'] = (df['profit'] / df['revenue'].replace(0, 1)) * 100
    GLOBAL_DATA["df"] = df.copy()
    
    total_revenue = float(df['revenue'].sum())
    total_profit = float(df['profit'].sum())
    avg_margin = float((total_profit / total_revenue) * 100) if total_revenue > 0 else 0

    # --- MODEL 1: ISOLATION FOREST FOR ANOMALY-BASED PROFIT LEAKS ---
    features_for_anomaly = df[['revenue', 'discount_percent', 'margin_pct']]
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features_for_anomaly)
    
    iso_forest = IsolationForest(contamination=0.15, random_state=42)
    df['is_anomaly'] = iso_forest.fit_predict(scaled_features)
    
    df['anomaly_score'] = -iso_forest.decision_function(scaled_features)
    anomalies = df[df['is_anomaly'] == -1]
    profit_leaks_output = []
    
    for product in anomalies['product_name'].unique()[:3]:
        prod_anon = anomalies[anomalies['product_name'] == product]
        loss_est = float((prod_anon['cost'] * 1.25 - prod_anon['revenue']).clip(lower=0).sum())
        
        avg_score = prod_anon['anomaly_score'].mean()
        confidence = float(np.clip(0.70 + (avg_score * 0.20), 0.70, 0.99))
        
        loss_impact_pct = loss_est / total_profit if total_profit > 0 else 0
        if loss_impact_pct > 0.10: 
            severity = "Critical"
        elif loss_impact_pct > 0.05: 
            severity = "High"
        else:
            severity = "Medium"

        profit_leaks_output.append({
            "type": "Pricing Anomaly",
            "product": str(product),
            "estimated_loss": round(loss_est, 2),
            "avg_discount_pct": round(prod_anon['discount_percent'].mean(), 1),
            "severity": severity,
            "confidence_score": round(confidence, 2)
        })

    # --- RISK CALCULATIONS ---
    cust_metrics = df.groupby('customer_id').agg(
        cust_rev=('revenue', 'sum'),
        avg_delay=('days_to_pay', 'mean')
    ).reset_index()
    
    customer_risks = []
    total_late_invoiced = 0
    for _, row in cust_metrics.iterrows():
        concentration_pct = (row['cust_rev'] / total_revenue) * 100
        if concentration_pct > 25:
            customer_risks.append({
                "customer": str(row['customer_id']),
                "issue": "High Concentration Risk",
                "detail": f"Accounts for {concentration_pct:.1f}% of total enterprise value."
            })
        if row['avg_delay'] > 30:
            customer_risks.append({
                "customer": str(row['customer_id']),
                "issue": "Late Payments",
                "days_delayed": int(row['avg_delay'])
            })
            total_late_invoiced += row['cust_rev']

    # --- MODEL 2: RANDOM FOREST REGRESSOR FOR PROFIT FORECASTING ---
    historical_trend = []
    if 'transaction_date' in df.columns:
        df['transaction_date'] = pd.to_datetime(df['transaction_date'], errors='coerce')
        valid_dates = df.dropna(subset=['transaction_date'])
        
        if not valid_dates.empty:
            monthly_profit = (
                valid_dates.groupby(valid_dates["transaction_date"].dt.to_period("M"))
                .agg(monthly_profit=("profit", "sum"))
                .reset_index()
            )
            
            monthly_profit['transaction_date'] = monthly_profit['transaction_date'].astype(str)
            monthly_profit['time_step'] = np.arange(len(monthly_profit))
            
            X_train = monthly_profit[['time_step']]
            y_train = monthly_profit['monthly_profit']
            
            rf_regressor = RandomForestRegressor(n_estimators=50, random_state=42)
            rf_regressor.fit(X_train, y_train)
            
            future_step = np.array([[len(monthly_profit)]])
            predicted_next_profit = float(rf_regressor.predict(future_step)[0])
            
            historical_trend = monthly_profit[['transaction_date', 'monthly_profit']].rename(
                columns={'transaction_date': 'month'}
            ).to_dict(orient="records")
        else:
            predicted_next_profit = float(total_profit / 12) if total_profit > 0 else 0
    else:
        predicted_next_profit = float(total_profit / 12) if total_profit > 0 else 0

    late_ratio = total_late_invoiced / total_revenue if total_revenue > 0 else 0
    max_concentration = cust_metrics['cust_rev'].max() / total_revenue if total_revenue > 0 else 0
    health_score = calculate_health_score(avg_margin, late_ratio, max_concentration)

    results = {
        "metrics": {
            "revenue": total_revenue,
            "profit": total_profit,
            "profit_margin": round(avg_margin, 1),
            "health_score": health_score
        },
        "profit_leaks": profit_leaks_output,
        "customer_risks": customer_risks,
        "forecast": {
            "next_month_profit": round(predicted_next_profit, 2),
            "historical_trend": historical_trend
        }
    }
    GLOBAL_DATA["analysis"] = results
    return results

# --- ENDPOINTS ---

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Handles chat messages (including voice transcriptions) from the frontend.
    Runs the message through RAG retrieval and the Gemma agent.
    """
    agent = get_gemma_agent()
    
    # Dynamically inject the live data context instead of hardcoding it!
    ml_context = "ML Context: No data uploaded yet."
    analysis = GLOBAL_DATA.get("analysis")
    if analysis:
        metrics = analysis.get("metrics", {})
        leaks = analysis.get("profit_leaks", [])
        leak_str = ", ".join([f"{l['product']} (loss: {l['estimated_loss']})" for l in leaks]) if leaks else "None detected"
        
        ml_context = f"Live ML Context:\n- Revenue: ₹{metrics.get('revenue', 0):,.2f}\n- Margin: {metrics.get('profit_margin', 0)}%\n- Health Score: {metrics.get('health_score', 0)}/100\n- Profit Leaks Detected: {leak_str}"
        
    try:
        response_data = agent.generate_response(request.message, request.history, ml_context)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    """Standard CSV batch ingest portal."""
    df = pd.read_csv(file.file, sep=None, engine='python')
    return run_ml_analysis(df)

@app.post("/extract")
async def extract_and_analyze_image(file: UploadFile = File(...)):
    """
    Multimodal Document Entryway.
    Accepts an invoice/ledger image, leverages Gemma Vision to pull tabular data,
    and runs the analysis immediately so the dashboard populates dynamically.
    """
    contents = await file.read()
    
    prompt = """
    Analyze this business ledger or invoice document carefully. 
    Extract every single line-item transaction into the requested JSON schema structure.
    Do not alter or guess raw numerical data. Keep strings clean and uniform.
    """
    
    try:
        # We use the hackathon-specific Gemma vision model.
        vision_model = os.environ.get("VISION_MODEL_NAME", "gemma-4-31b-it")
        response = client.models.generate_content(
            model=vision_model,
            contents=[
                types.Part.from_bytes(
                    data=contents,
                    mime_type=file.content_type
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=InvoiceExtractionSchema,
                temperature=0.1
            ),
        )
        
        # Parse the rigid structured output from Gemma, handling potential markdown wrappers
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        extracted_json = json.loads(raw_text.strip())
        transactions_list = extracted_json.get("transactions", [])
        
        if not transactions_list:
            raise HTTPException(status_code=422, detail="Gemma couldn't isolate any transactions in the image.")
            
        # Transform extracted structured items straight into your Pandas workflow
        df = pd.DataFrame(transactions_list)
        
        # Pipe it into the engine automatically
        analysis_results = run_ml_analysis(df)
        
        # Return both the raw extraction AND the final analysis so Member 3 can build beautiful UIs
        return {
            "extracted_data": transactions_list,
            "analysis": analysis_results
        }
        
    except HTTPException:
        # Re-raise the intended HTTP exception without wrapping it in a 500
        raise
    except Exception as e:
        import traceback
        with open("error_log.txt", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Multimodal Engine Failure: {str(e)}")

@app.post("/simulator")
async def run_what_if_simulation(payload: SimulationPayload):
    if GLOBAL_DATA["df"] is None:
        return {"status": "error", "message": "Upload data via /analyze or /extract first."}
        
    df = GLOBAL_DATA["df"].copy()
    simulated_revenue = df['revenue'] * (1 + (payload.price_change_pct / 100))
    simulated_revenue = simulated_revenue * (1 + (payload.discount_change_pct / 100))
    simulated_profit = simulated_revenue - df['cost']
    
    profit_delta = simulated_profit.sum() - df['profit'].sum()
    
    return {
        "simulated_revenue": float(simulated_revenue.sum()),
        "simulated_profit": float(simulated_profit.sum()),
        "profit_delta": float(profit_delta),
        "impact_direction": "positive" if profit_delta >= 0 else "negative"
    }

@app.get("/dashboard")
async def get_dashboard():
    if GLOBAL_DATA["df"] is None:
        return {"status": "error", "message": "No data uploaded yet."}
    
    df = GLOBAL_DATA["df"]
    
    if 'transaction_date' in df.columns:
        df['transaction_date'] = pd.to_datetime(df['transaction_date'], errors='coerce')
        valid_dates_df = df.dropna(subset=['transaction_date'])
        if not valid_dates_df.empty:
            valid_dates_df = valid_dates_df.copy()
            valid_dates_df['month'] = valid_dates_df['transaction_date'].dt.strftime('%b %Y')
            monthly_trend = valid_dates_df.groupby('month').agg(
                revenue=('revenue', 'sum'),
                profit=('profit', 'sum')
            ).reset_index().to_dict(orient="records")
        else:
            monthly_trend = [{"note": "Date parameters missing or invalid."}]
    else:
        monthly_trend = [{"note": "Date parameters missing."}]

    product_analysis = df.groupby('product_name').agg(
        revenue=('revenue', 'sum'),
        profit=('profit', 'sum')
    ).reset_index()
    product_analysis['margin'] = (product_analysis['profit'] / product_analysis['revenue']) * 100
    product_analysis['margin'] = product_analysis['margin'].replace([float('inf'), float('-inf'), float('nan')], 0)
    
    customer_analysis = df.groupby('customer_id').agg(
        revenue=('revenue', 'sum'),
        profit=('profit', 'sum')
    ).reset_index()
    customer_analysis['margin'] = (customer_analysis['profit'] / customer_analysis['revenue']) * 100
    customer_analysis['margin'] = customer_analysis['margin'].replace([float('inf'), float('-inf'), float('nan')], 0)

    # Safe overall margin calculation
    total_rev = float(df['revenue'].sum())
    total_prof = float(df['profit'].sum())
    overall_margin = (total_prof / total_rev * 100) if total_rev != 0 else 0.0

    return {
        "metrics": {
            "total_revenue": total_rev,
            "total_profit": total_prof,
            "overall_margin": overall_margin
        },
        "monthly_trend": monthly_trend,
        "product_analysis": product_analysis.fillna(0).to_dict(orient="records"),
        "customer_analysis": customer_analysis.fillna(0).to_dict(orient="records")
    }

@app.get("/profit")
async def get_profit_summary():
    if GLOBAL_DATA["df"] is None:
        return {"status": "error", "message": "No data available."}
    df = GLOBAL_DATA["df"]
    top_product = df.groupby('product_name')['profit'].sum().idxmax()
    return {
        "total_profit": float(df['profit'].sum()),
        "margin": float((df['profit'].sum() / df['revenue'].sum()) * 100),
        "top_product": str(top_product)
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "profit-pilot-backend"}
