# Jules Industrial Gear Solutions — Dataset Metadata

This document describes the schema and details of the company dataset located at `backend/data/jules_sales.csv` for the **Jules Industrial Gear Solutions** SME business profile.

---

## 📋 Schema Columns

| Column Name | Data Type | Example Value | Description |
| :--- | :--- | :--- | :--- |
| **TransactionID** | Integer | `10001` | Unique transaction identifier |
| **Date** | YYYY-MM-DD | `2026-06-15` | Invoice issuance date |
| **CustomerID** | String | `CUST001` | Unique customer code |
| **CustomerName** | String | `Acme Industrial Corp` | Customer trade name |
| **ProductID** | String | `PROD001` | Product SKU |
| **ProductName** | String | `High-Performance Widget`| Commercial product name |
| **ProductCategory**| String | `Hardware` | Department/Line of business |
| **Quantity** | Integer | `24` | Quantity purchased |
| **UnitPrice** | Float | `150.00` | Standard wholesale list price |
| **DiscountPercent**| Float (0 to 1) | `0.3500` | Discount applied (e.g. 0.35 = 35% discount) |
| **CostPerUnit** | Float | `90.00` | Cost of goods sold (COGS) per unit |
| **Revenue** | Float | `2340.00` | Net sale value: `(Quantity * UnitPrice) * (1 - DiscountPercent)` |
| **Cost** | Float | `2160.00` | Total cost of transaction: `Quantity * CostPerUnit` |
| **Profit** | Float | `180.00` | Profit margin: `Revenue - Cost` |
| **InvoiceDate** | YYYY-MM-DD | `2026-06-15` | Date billed |
| **PaymentDate** | YYYY-MM-DD | `2026-07-28` | Date invoice was settled (empty if unpaid) |
| **TermsDays** | Integer | `30` | Customer contract payment terms in days |
| **Status** | String | `Paid` | Invoice status: `Paid` or `Unpaid` |

---

## 🏭 Company Catalog

### Customers
1. **Acme Industrial Corp** (Contract: Net 30, represents 35% of total sales). *Flag: Customer Concentration Risk.*
2. **Beta Retailers** (Contract: Net 15, represents 15% of sales).
3. **Apex Tech Solutions** (Contract: Net 30, represents 20% of sales). *Flag: Late payments (pays 45-85 days late).*
4. **Zeta Enterprises** (Contract: Net 45, represents 15% of sales).
5. **Omega Distributors** (Contract: Net 30, represents 15% of sales).

### Products
* **High-Performance Widget** (Hardware, Price: $150, Cost: $90) — High margin.
* **Standard Gear Assembly** (Hardware, Price: $80, Cost: $45) — Normal margin.
* **Low-Margin Bulk Connector** (Hardware, Price: $10, Cost: $9.5) — Very low margin (5%). *Flag: Low-margin product leakage.*
* **Enterprise Service License** (Software, Price: $500, Cost: $150) — Software high-margin line.
* **Premium Consulting Hour** (Services, Price: $200, Cost: $120) — Professional services line.

---

## 🚨 Injected Anomalies for Gemma to Diagnose

1. **Discount Leakage (June 2026 Profit Dip)**:
   * *Anomaly*: Sales reps gave discounts between **25% and 45%** on major orders for Acme Industrial Corp to hit volume targets in June 2026.
   * *Result*: Total profit in June 2026 plummeted to **$54,455** from **$138,823** in May 2026.
   * *Gemma's Reasoning*: Gemma will fetch the profit leaks from the ML engine, see the high discount rates, cross-reference the retrieved RAG guide [pricing_strategies.md](file:///c:/Users/hp/Profit%20pilot/backend/knowledge_base/pricing_strategies.md) on pre-approved discount tiers, and advise the user to implement approval limits.
2. **Late Payment Delays (DSO & Collections)**:
   * *Anomaly*: Customer Apex Tech Solutions regularly settles bills 15 to 55 days *past* their 30-day terms.
   * *Result*: Outstanding receivables lock up cash flow.
   * *Gemma's Reasoning*: Gemma checks late payment metrics, flags Apex Tech, references RAG guide [payment_collection.md](file:///c:/Users/hp/Profit%20pilot/backend/knowledge_base/payment_collection.md) to draft a collection email, and advises offering a 2% early payment discount.
3. **Customer Concentration Exposure**:
   * *Anomaly*: Acme Industrial Corp represents **35%** of total revenue.
   * *Result*: If Acme decreases orders, the business goes into a loss.
   * *Gemma's Reasoning*: Gemma detects concentration >20%, flags this risk, references RAG guide [customer_retention.md](file:///c:/Users/hp/Profit%20pilot/backend/knowledge_base/customer_retention.md), and recommends client diversification tactics.
