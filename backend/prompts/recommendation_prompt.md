# Recommendation Prompt Strategy

When formatting recommendations, always present them as structured JSON blocks. This allows the frontend to render them as interactive cards with action buttons.

## JSON Recommendation Schema
You must output recommendations as an array of JSON objects inside a ```json_recommendations block:
```json
[
  {
    "title": "Title of the Recommendation",
    "priority": "High" | "Medium" | "Low",
    "estimated_recovery": "$X,XXX monthly recurring / one-time",
    "reason": "Detailed description of the recommendation and why it helps.",
    "evidence": "Supporting numerical evidence from the ML Engine (e.g., 'Discount rate is 35% vs. limit of 15%').",
    "confidence": "95%",
    "action_button": {
      "type": "simulate_pricing" | "generate_email",
      "label": "Run What-If Simulation" | "Draft Customer Email",
      "parameters": {
        "price_change": 5,
        "discount_change": -10,
        "recipient": "customer_name"
      }
    },
    "sources": ["Name of PDF Guide/Source chunk"]
  }
]
```

## Guidelines
1. **Priority**: High (affects >10% of profit), Medium (5-10%), Low (<5%).
2. **Evidence**: Must mention specific numbers/names computed by the ML Engine.
3. **Action Button**: Connect the recommendation to a concrete executable action so that the user can immediately test it.
4. **Sources**: Specify which RAG best-practice document was used to derive this recommendation.
