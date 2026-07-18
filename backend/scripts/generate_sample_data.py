import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_data():
    np.random.seed(42)
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 6, 30)
    
    # Define Customers
    customers = [
        {"id": "CUST001", "name": "Acme Industrial Corp", "terms_days": 30, "prob": 0.35},  # Customer concentration risk (large share)
        {"id": "CUST002", "name": "Beta Retailers", "terms_days": 15, "prob": 0.15},
        {"id": "CUST003", "name": "Apex Tech Solutions", "terms_days": 30, "prob": 0.20},   # Chronic late payer
        {"id": "CUST004", "name": "Zeta Enterprises", "terms_days": 45, "prob": 0.15},
        {"id": "CUST005", "name": "Omega Distributors", "terms_days": 30, "prob": 0.15}
    ]
    
    # Define Products
    products = [
        {"id": "PROD001", "name": "High-Performance Widget", "category": "Hardware", "price": 150.0, "cost": 90.0},
        {"id": "PROD002", "name": "Standard Gear Assembly", "category": "Hardware", "price": 80.0, "cost": 45.0},
        {"id": "PROD003", "name": "Low-Margin Bulk Connector", "category": "Hardware", "price": 10.0, "cost": 9.5},  # Low margin product
        {"id": "PROD004", "name": "Enterprise Service License", "category": "Software", "price": 500.0, "cost": 150.0},
        {"id": "PROD005", "name": "Premium Consulting Hour", "category": "Services", "price": 200.0, "cost": 120.0}
    ]
    
    records = []
    current_date = start_date
    tx_id = 10001
    
    # Generate daily/weekly transactions
    while current_date <= end_date:
        # Number of transactions on this day (0 to 5)
        n_tx = np.random.randint(0, 6)
        
        for _ in range(n_tx):
            # Select Customer
            cust_probs = [c["prob"] for c in customers]
            cust = np.random.choice(customers, p=cust_probs)
            
            # Select Product
            prod = np.random.choice(products)
            
            # Quantity
            qty = np.random.randint(1, 15)
            if cust["id"] == "CUST001": # Acme buys bulk
                qty = np.random.randint(10, 40)
                
            # Pricing & Discounts
            # Normal discount is 0-10%
            discount = np.random.uniform(0.0, 0.10)
            
            # ANOMALY 1: Discount Leakage in June 2026
            # Salespeople gave massive discounts to hit targets, lowering profit margin
            if current_date.year == 2026 and current_date.month == 6:
                if np.random.rand() > 0.4:
                    discount = np.random.uniform(0.25, 0.45) # 25% - 45% discount!
            
            # Calculate Revenue & Cost
            subtotal = qty * prod["price"]
            discount_amount = subtotal * discount
            revenue = subtotal - discount_amount
            cost = qty * prod["cost"]
            profit = revenue - cost
            
            # Dates & Invoice Aging
            invoice_date = current_date
            terms = cust["terms_days"]
            
            # ANOMALY 2: Late Payments from Customer Apex Tech Solutions
            # Standard payment terms are Net 30. Apex pays very late (45 to 80 days)
            due_date = invoice_date + timedelta(days=terms)
            
            if cust["id"] == "CUST003":  # Chronic late payer
                delay = np.random.randint(45, 85)
            else:
                # Normal variation
                delay = np.random.randint(terms - 5, terms + 10)
                
            payment_date = invoice_date + timedelta(days=delay)
            status = "Paid"
            
            # If transaction is in the last month, some invoices might still be unpaid
            if (end_date - invoice_date).days < 30:
                if np.random.rand() > 0.5:
                    status = "Unpaid"
                    payment_date = None
            
            records.append({
                "TransactionID": tx_id,
                "Date": invoice_date.strftime("%Y-%m-%d"),
                "CustomerID": cust["id"],
                "CustomerName": cust["name"],
                "ProductID": prod["id"],
                "ProductName": prod["name"],
                "ProductCategory": prod["category"],
                "Quantity": qty,
                "UnitPrice": prod["price"],
                "DiscountPercent": round(discount, 4),
                "CostPerUnit": prod["cost"],
                "Revenue": round(revenue, 2),
                "Cost": round(cost, 2),
                "Profit": round(profit, 2),
                "InvoiceDate": invoice_date.strftime("%Y-%m-%d"),
                "PaymentDate": payment_date.strftime("%Y-%m-%d") if payment_date else "",
                "TermsDays": terms,
                "Status": status
            })
            tx_id += 1
            
        current_date += timedelta(days=1)
        
    df = pd.DataFrame(records)
    
    # Save to data directory
    os.makedirs("backend/data", exist_ok=True)
    csv_path = "backend/data/sample_business_data.csv"
    df.to_csv(csv_path, index=False)
    print(f"Sample data generated successfully at {csv_path}")
    print(f"Total transactions: {len(df)}")
    print(f"June 2026 records: {len(df[pd.to_datetime(df['Date']).dt.to_period('M') == '2026-06'])}")
    print(f"Profit in June 2026 vs May 2026: {df[pd.to_datetime(df['Date']).dt.to_period('M') == '2026-06']['Profit'].sum()} vs {df[pd.to_datetime(df['Date']).dt.to_period('M') == '2026-05']['Profit'].sum()}")

if __name__ == "__main__":
    generate_sample_data()
