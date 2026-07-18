# ProfitPilot — AI Layer API Specifications

This document defines the HTTP endpoints, payload formats, and JSON responses that the FastAPI backend (AI Layer) will expose. 

All communications are in JSON format.

---

## 1. File Upload Endpoint

Uploads the ledger CSV and computes baseline metrics immediately, caching the dataframe and baseline statistics in session storage.

* **Route**: `/api/upload`
* **Method**: `POST`
* **Payload**: `multipart/form-data`
  * `file`: The ledger CSV file (e.g. `jules_sales.csv`).
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "filename": "jules_sales.csv",
    "record_count": 1275,
    "baseline_metrics": {
      "total_revenue": 542100.50,
      "total_cost": 298000.00,
      "total_profit": 244100.50,
      "average_margin_pct": 45.03,
      "overall_health_score": 78.4
    },
    "proactive_brief": "I have successfully analyzed the sales data. I detected two critical items: customer concentration with Acme Corp (35% of revenue) and a profit dip in June 2026 caused by high discount rates. Would you like me to explain these?"
  }
  ```

---

## 2. Interactive Chat Endpoint

Takes a user question, manages the tool execution trace, searches the vector database, and generates Gemma's response.

* **Route**: `/api/chat`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "message": "Why did my profit decrease in June?",
    "session_id": "session-12345"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "response": "Your profits dropped by 60% in June 2026 because sales reps offered discounts up to 45% for Acme Industrial Corp. Based on credit policies, we recommend capping discounts at 15%...",
    "recommendations": [
      {
        "title": "Enforce 15% Max Discount Cap",
        "priority": "High",
        "estimated_recovery": "$12,400 monthly",
        "reason": "Acme Industrial Corp discounts averaged 32% in June, which severely eroded net margins.",
        "evidence": "Average discount rate in June was 32% vs historical 8%.",
        "confidence": "95%",
        "action_button": {
          "type": "simulate_pricing",
          "label": "Simulate 15% Cap",
          "parameters": {
            "discount_change": -17.0
          }
        },
        "sources": ["pricing_strategies.md"]
      }
    ],
    "agent_thoughts": [
      "🧠 User is asking about June 2026 profit decline.",
      "⚙️ Running calculate_profit() for monthly trend.",
      "⚙️ Running find_profit_leaks() to detect discount abuse.",
      "🔍 Found: Acme Industrial Corp discount rate spiked to 32% in June.",
      "📖 Searching RAG: pricing strategies and discount limits.",
      "💡 Synthesizing response using Gemma reasoning model."
    ],
    "sources": [
      {
        "filename": "pricing_strategies.md",
        "score": 0.88,
        "content_snippet": "Many SMEs use discounting to hit volume targets. A 10% discount on a 30% margin product requires a 50% volume increase..."
      }
    ]
  }
  ```

---

## 3. What-If Simulator Endpoint

Invokes recalculations on the active dataset using what-if sliders and returns the simulated values.

* **Route**: `/api/simulate`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "price_pct_change": 5.0,
    "discount_pct_change": -10.0,
    "collection_days_reduction": 15
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "original": {
      "revenue": 542100.50,
      "profit": 244100.50,
      "margin_pct": 45.03
    },
    "simulated": {
      "revenue": 568320.00,
      "profit": 281450.20,
      "margin_pct": 49.52
    },
    "impact": {
      "revenue_change": 26219.50,
      "profit_change": 37349.70,
      "margin_change_pct": 4.49,
      "cash_unlocked_from_ar": 22285.34
    },
    "simulated_trend": [
      {
        "period": "2026-06",
        "revenue": 68000.00,
        "cost": 31000.00,
        "profit": 37000.00,
        "margin": 54.4
      }
    ]
  }
  ```

---

## 4. Business Health Report Endpoint

Instructs Gemma to compile the complete, structured PDF Business Health Report and returns it as a downloadable file.

* **Route**: `/api/report`
* **Method**: `GET`
* **Response**: `application/pdf` (Binary stream of the generated business report).

---

## 5. Audit Log Ledger Endpoint

Returns the execution traces of all tool calls, data logs, RAG query results, and historical reasoning states for transparent demo reviews.

* **Route**: `/api/audit-logs`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "logs": [
      {
        "timestamp": "2026-07-17T20:30:00Z",
        "event_type": "gemma_tool_call",
        "details": {
          "tool_name": "find_profit_leaks",
          "arguments": {},
          "status": "success",
          "execution_time_ms": 142
        }
      },
      {
        "timestamp": "2026-07-17T20:30:02Z",
        "event_type": "rag_query",
        "details": {
          "query": "late payments credit control invoice reminders",
          "chunks_returned": 2,
          "top_match_file": "payment_collection.md"
        }
      }
    ]
  }
  ```
