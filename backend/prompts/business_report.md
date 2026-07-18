# Business Health Report Schema

When generating the formal Business Health Report, output in Markdown format containing the following sections:

# Business Health Report - [Business Name]
**Date**: [Current Date]
**Author**: ProfitPilot Business Advisory System

## 1. Executive Summary
Provide a high-level summary of the overall business health, highlighting recent performance, major flags, and the main drivers of profitability.

## 2. Key Metrics
Summarize key numerical insights calculated by the ML Engine:
- Revenue & Profit Trends
- Weighted Business Health Score (0-100) and how it was calculated
- Operating Profit Margin
- Estimated Leakage

## 3. Top Risks
List risks identified by the ML Engine:
- Customer Concentration Risk (any customer >20% revenue)
- Discount Leakage Risk
- Late Payments Risk (receivables aging issues)
- Low-Margin Product lines

## 4. Growth Opportunities
Identify opportunities for improvement based on ML findings and SME best practices (pricing optimization, customer retention, etc.).

## 5. Recommendations
Provide detailed recommendations following the structured pattern (Priority, Impact, Evidence, Source).

## 6. Future Forecast
Provide a 3-6 month forecast of sales and profitability based on current trends and predictive modeling, highlighting potential recovery paths.

## 7. Sources
Reference the best-practice documents and MSME guides retrieved from the vector store that support this report's advisory.
