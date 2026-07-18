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
client = genai.Client()

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
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        
        monthly_profit = (
            df.groupby(df["transaction_date"].dt.to_period("M"))
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

    late_ratio = total_late_invoiced / total_revenue if total_revenue > 0 else 0
    max_concentration = cust_metrics['cust_rev'].max() / total_revenue if total_revenue > 0 else 0
    health_score = calculate_health_score(avg_margin, late_ratio, max_concentration)

    return {
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

# --- ENDPOINTS ---

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Handles chat messages (including voice transcriptions) from the frontend.
    Runs the message through RAG retrieval and the Gemma agent.
    """
    agent = get_gemma_agent()
    
    try:
        response_data = agent.generate_response(request.message, request.history)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    """Standard CSV batch ingest portal."""
    df = pd.read_csv(file.file)
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
        # Requesting Gemma-2.5-Flash or equivalent multimodal track models using the current SDK format
        response = client.models.generate_content(
            model="models/gemma-4-31b-it", # Adjust this targeting string to your hackathon environment rules
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
        
        # Parse the rigid structured output from Gemma
        extracted_json = json.loads(response.text)
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
        
    except Exception as e:
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
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        df['month'] = df['transaction_date'].dt.strftime('%b %Y')
        monthly_trend = df.groupby('month').agg(
            revenue=('revenue', 'sum'),
            profit=('profit', 'sum')
        ).reset_index().to_dict(orient="records")
    else:
        monthly_trend = [{"note": "Date parameters missing."}]

    product_analysis = df.groupby('product_name').agg(
        revenue=('revenue', 'sum'),
        profit=('profit', 'sum')
    ).reset_index()
    product_analysis['margin'] = (product_analysis['profit'] / product_analysis['revenue']) * 100
    
    customer_analysis = df.groupby('customer_id').agg(
        revenue=('revenue', 'sum'),
        profit=('profit', 'sum')
    ).reset_index()
    customer_analysis['margin'] = (customer_analysis['profit'] / customer_analysis['revenue']) * 100

    return {
        "metrics": {
            "total_revenue": float(df['revenue'].sum()),
            "total_profit": float(df['profit'].sum()),
            "overall_margin": float((df['profit'].sum() / df['revenue'].sum()) * 100)
        },
        "monthly_trend": monthly_trend,
        "product_analysis": product_analysis.to_dict(orient="records"),
        "customer_analysis": customer_analysis.to_dict(orient="records")
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
