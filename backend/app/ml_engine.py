import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor

def load_data(filepath_or_df):
    if isinstance(filepath_or_df, pd.DataFrame):
        df = filepath_or_df.copy()
    else:
        df = pd.read_csv(filepath_or_df)
    
    # Parse dates
    df['Date'] = pd.to_datetime(df['Date'])
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['PaymentDate'] = pd.to_datetime(df['PaymentDate'])
    return df

def calculate_profit(df):
    """
    Computes baseline metrics from raw ledger data.
    """
    total_revenue = float(df['Revenue'].sum())
    total_cost = float(df['Cost'].sum())
    total_profit = float(df['Profit'].sum())
    avg_margin = (total_profit / total_revenue) if total_revenue > 0 else 0.0
    
    # Group by month for trend
    monthly = df.groupby(df['Date'].dt.to_period('M')).agg({
        'Revenue': 'sum',
        'Cost': 'sum',
        'Profit': 'sum'
    }).reset_index()
    monthly['DateStr'] = monthly['Date'].astype(str)
    monthly['Margin'] = (monthly['Profit'] / monthly['Revenue']).fillna(0.0)
    
    # Trend records
    trend = []
    for _, row in monthly.iterrows():
        trend.append({
            "period": row['DateStr'],
            "revenue": round(float(row['Revenue']), 2),
            "cost": round(float(row['Cost']), 2),
            "profit": round(float(row['Profit']), 2),
            "margin": round(float(row['Margin'] * 100), 2)
        })
        
    return {
        "total_revenue": round(total_revenue, 2),
        "total_cost": round(total_cost, 2),
        "total_profit": round(total_profit, 2),
        "average_margin_pct": round(avg_margin * 100, 2),
        "monthly_trend": trend
    }

def find_profit_leaks(df):
    """
    Detects business risks and anomalies in transaction history.
    """
    total_revenue = df['Revenue'].sum()
    
    # 1. Customer Concentration Risk
    cust_rev = df.groupby(['CustomerID', 'CustomerName'])['Revenue'].sum().reset_index()
    cust_rev['ConcentrationPct'] = (cust_rev['Revenue'] / total_revenue) * 100
    concentration_flags = cust_rev[cust_rev['ConcentrationPct'] >= 20.0].to_dict(orient='records')
    
    # 2. Discount Leakage (Discount > 15% is flagged as leak)
    # We compute what was lost in profit by giving discounts > 15%
    df['Subtotal'] = df['Quantity'] * df['UnitPrice']
    df['ExcessDiscount'] = df['DiscountPercent'].apply(lambda d: max(0.0, d - 0.15))
    df['DiscountLeak'] = df['Subtotal'] * df['ExcessDiscount']
    total_discount_leak = float(df['DiscountLeak'].sum())
    
    discount_leaks_by_cust = df[df['DiscountPercent'] > 0.15].groupby(['CustomerID', 'CustomerName']).agg({
        'DiscountLeak': 'sum',
        'Revenue': 'sum',
        'DiscountPercent': 'mean'
    }).reset_index()
    discount_leaks_by_cust['DiscountPercent'] = discount_leaks_by_cust['DiscountPercent'] * 100
    discount_leaks_list = discount_leaks_by_cust.to_dict(orient='records')
    
    # 3. Late Payments & Cash Flow Risk
    # Receivables delay = PaymentDate - InvoiceDate
    paid_df = df[df['Status'] == 'Paid'].copy()
    paid_df['PaymentDelay'] = (paid_df['PaymentDate'] - paid_df['InvoiceDate']).dt.days
    
    cust_delays = paid_df.groupby(['CustomerID', 'CustomerName']).agg({
        'PaymentDelay': 'mean',
        'TermsDays': 'first'
    }).reset_index()
    cust_delays['LateDays'] = cust_delays['PaymentDelay'] - cust_delays['TermsDays']
    late_payer_flags = cust_delays[cust_delays['LateDays'] > 5].to_dict(orient='records')
    
    # Outstanding receivables
    unpaid_df = df[df['Status'] == 'Unpaid']
    total_unpaid_receivables = float(unpaid_df['Revenue'].sum())
    
    # 4. Low-Margin Products (Margin < 15%)
    prod_rev = df.groupby(['ProductID', 'ProductName']).agg({
        'Revenue': 'sum',
        'Cost': 'sum'
    }).reset_index()
    prod_rev['MarginPct'] = ((prod_rev['Revenue'] - prod_rev['Cost']) / prod_rev['Revenue']) * 100
    low_margin_flags = prod_rev[prod_rev['MarginPct'] < 15.0].to_dict(orient='records')
    
    return {
        "customer_concentration": [
            {
                "customer_id": r["CustomerID"],
                "customer_name": r["CustomerName"],
                "revenue": round(float(r["Revenue"]), 2),
                "concentration_pct": round(float(r["ConcentrationPct"]), 2)
            } for r in concentration_flags
        ],
        "discount_leakage": {
            "total_leakage": round(total_discount_leak, 2),
            "details": [
                {
                    "customer_id": r["CustomerID"],
                    "customer_name": r["CustomerName"],
                    "leakage_amount": round(float(r["DiscountLeak"]), 2),
                    "avg_discount_pct": round(float(r["DiscountPercent"]), 2),
                    "customer_revenue": round(float(r["Revenue"]), 2)
                } for r in discount_leaks_list
            ]
        },
        "late_payments": {
            "outstanding_receivables": round(total_unpaid_receivables, 2),
            "late_payers": [
                {
                    "customer_id": r["CustomerID"],
                    "customer_name": r["CustomerName"],
                    "avg_payment_delay_days": round(float(r["PaymentDelay"]), 1),
                    "agreed_terms_days": int(r["TermsDays"]),
                    "avg_late_days": round(float(r["LateDays"]), 1)
                } for r in late_payer_flags
            ]
        },
        "low_margin_products": [
            {
                "product_id": r["ProductID"],
                "product_name": r["ProductName"],
                "revenue": round(float(r["Revenue"]), 2),
                "margin_pct": round(float(r["MarginPct"]), 2)
            } for r in low_margin_flags
        ]
    }

def calculate_health_score(df):
    """
    Computes a weighted business health score based on core financial indicators:
    - Profit Margin: 25%
    - Customer Concentration Risk: 20%
    - Late Payments Score: 20%
    - Discount Leakage Score: 20%
    - Profit Trend: 15%
    """
    # 1. Profit Margin Score (ideal margin > 30% = 100 pts, scales down)
    metrics = calculate_profit(df)
    margin_pct = metrics['average_margin_pct']
    margin_score = min(100.0, max(0.0, (margin_pct / 30.0) * 100))
    
    # 2. Customer Concentration Score
    # Deduct points if any single customer has >20% concentration
    leaks = find_profit_leaks(df)
    max_concentration = 0.0
    for c in leaks['customer_concentration']:
        if c['concentration_pct'] > max_concentration:
            max_concentration = c['concentration_pct']
    # 20% or less = 100 points, 60% or more = 0 points
    concentration_score = 100.0 - min(100.0, max(0.0, (max_concentration - 20.0) * 2.5))
    
    # 3. Late Payments Score
    # DSO & average delay. If average late days > 0, deduct points
    late_payers = leaks['late_payments']['late_payers']
    if len(late_payers) == 0:
        late_payment_score = 100.0
    else:
        avg_late = np.mean([p['avg_late_days'] for p in late_payers])
        # 0 days late = 100 pts, 30+ days late = 0 pts
        late_payment_score = max(0.0, 100.0 - (avg_late * 3.33))
        
    # 4. Discount Leakage Score
    # Leakage ratio = total leakage / total revenue.
    # 0% leakage = 100 pts, 10% or more leakage = 0 pts
    total_rev = metrics['total_revenue']
    leakage_amount = leaks['discount_leakage']['total_leakage']
    leak_pct = (leakage_amount / total_rev * 100) if total_rev > 0 else 0.0
    discount_score = max(0.0, 100.0 - (leak_pct * 10))
    
    # 5. Profit Trend Score
    # Compare profit of last 3 months vs prior 3 months
    trend = metrics['monthly_trend']
    if len(trend) >= 6:
        recent_profit = sum([t['profit'] for t in trend[-3:]])
        prior_profit = sum([t['profit'] for t in trend[-6:-3]])
        growth = (recent_profit - prior_profit) / prior_profit if prior_profit > 0 else 0.0
        # Growth >= 10% = 100 pts, decline of -20% = 0 pts
        trend_score = min(100.0, max(0.0, (growth + 0.20) / 0.30 * 100))
    else:
        trend_score = 75.0  # neutral default
        
    # Weighted Average
    weighted_score = (
        (margin_score * 0.25) +
        (concentration_score * 0.20) +
        (late_payment_score * 0.20) +
        (discount_score * 0.20) +
        (trend_score * 0.15)
    )
    
    return {
        "overall_health_score": round(weighted_score, 1),
        "breakdown": {
            "profit_margin_score": round(margin_score, 1),
            "customer_concentration_score": round(concentration_score, 1),
            "late_payment_score": round(late_payment_score, 1),
            "discount_leakage_score": round(discount_score, 1),
            "profit_trend_score": round(trend_score, 1)
        }
    }

def forecast_profit(df, forecast_weeks=8):
    """
    Aggregates historical sales to a weekly frequency, extracts lag features,
    and trains a Random Forest Regressor to predict upcoming weekly profitability.
    Kept modular for easy swapping with ARIMA, Prophet, or XGBoost.
    """
    df_w = df.copy()
    df_w['Week'] = df_w['Date'].dt.to_period('W').dt.start_time
    
    # Aggregate weekly profit, revenue, cost
    weekly_data = df_w.groupby('Week').agg({
        'Revenue': 'sum',
        'Cost': 'sum',
        'Profit': 'sum',
        'DiscountPercent': 'mean'
    }).reset_index()
    
    # Sort
    weekly_data = weekly_data.sort_values('Week').reset_index(drop=True)
    
    n_samples = len(weekly_data)
    if n_samples < 8:
        # Fallback to simple linear extrapolation if dataset is too small
        last_val = weekly_data['Profit'].iloc[-1] if n_samples > 0 else 0
        forecast = [round(float(last_val * (1 + 0.005 * i)), 2) for i in range(1, forecast_weeks + 1)]
        return {"forecast_weekly_profit": forecast, "method": "linear_fallback"}
        
    # Build lag features: lag 1 week, lag 2 weeks, lag 3 weeks, week of year
    weekly_data['Lag_1'] = weekly_data['Profit'].shift(1)
    weekly_data['Lag_2'] = weekly_data['Profit'].shift(2)
    weekly_data['Lag_3'] = weekly_data['Profit'].shift(3)
    weekly_data['WeekOfYear'] = weekly_data['Week'].dt.isocalendar().week.astype(float)
    
    # Drop rows with NaN due to shift
    train_df = weekly_data.dropna().copy()
    
    X = train_df[['Lag_1', 'Lag_2', 'Lag_3', 'WeekOfYear']]
    y = train_df['Profit']
    
    # Train Random Forest Regressor
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Multi-step autoregressive forecasting
    predictions = []
    last_known_lags = list(weekly_data['Profit'].iloc[-3:]) # last three weeks
    current_date = weekly_data['Week'].iloc[-1]
    
    for i in range(1, forecast_weeks + 1):
        pred_week = current_date + pd.Timedelta(weeks=i)
        week_of_year = float(pred_week.isocalendar()[1])
        
        # Features: [Lag1, Lag2, Lag3, WeekOfYear]
        features = np.array([[last_known_lags[-1], last_known_lags[-2], last_known_lags[-3], week_of_year]])
        pred = model.predict(features)[0]
        
        predictions.append({
            "period": pred_week.strftime("%Y-W%W"),
            "predicted_profit": round(float(pred), 2)
        })
        
        # Slide lags
        last_known_lags.append(pred)
        last_known_lags.pop(0)
        
    return {
        "forecast": predictions,
        "method": "RandomForestRegressor"
    }

def simulate_pricing(df, price_pct_change=0.0, discount_pct_change=0.0, collection_days_reduction=0):
    """
    Simulates what-if scenario by modifying price structure and re-calculating financial outcomes.
    - price_pct_change: percentage to adjust standard price (e.g. +5% price increase)
    - discount_pct_change: percentage points to adjust absolute discount levels (e.g. -10% discount cap)
    - collection_days_reduction: improvement in accounts receivables payment collection delay.
    """
    sim_df = df.copy()
    
    # Original calculations
    sim_df['OriginalSubtotal'] = sim_df['Quantity'] * sim_df['UnitPrice']
    
    # 1. Price Adjustment
    sim_df['SimUnitPrice'] = sim_df['UnitPrice'] * (1 + (price_pct_change / 100.0))
    sim_df['SimSubtotal'] = sim_df['Quantity'] * sim_df['SimUnitPrice']
    
    # 2. Discount Adjustment (e.g. if original was 35%, and change is -10%, new discount is 25%)
    sim_df['SimDiscountPercent'] = sim_df['DiscountPercent'] + (discount_pct_change / 100.0)
    sim_df['SimDiscountPercent'] = sim_df['SimDiscountPercent'].apply(lambda d: max(0.0, min(1.0, d)))
    
    # Recalculate simulation values
    sim_df['SimRevenue'] = sim_df['SimSubtotal'] * (1 - sim_df['SimDiscountPercent'])
    sim_df['SimCost'] = sim_df['Quantity'] * sim_df['CostPerUnit']
    sim_df['SimProfit'] = sim_df['SimRevenue'] - sim_df['SimCost']
    
    # Aggregate outcomes
    orig_results = calculate_profit(df)
    sim_profit_metrics = calculate_profit(sim_df.rename(columns={
        'SimRevenue': 'Revenue',
        'SimCost': 'Cost',
        'SimProfit': 'Profit'
    }))
    
    # 3. DSO Improvement Cash Flow Impact
    # Cash flow unlocked = (Total Revenue / 365) * DSO Reduction
    avg_daily_rev = orig_results['total_revenue'] / 365.0
    cash_unlocked = avg_daily_rev * collection_days_reduction
    
    profit_diff = sim_profit_metrics['total_profit'] - orig_results['total_profit']
    margin_diff = sim_profit_metrics['average_margin_pct'] - orig_results['average_margin_pct']
    
    return {
        "original": {
            "revenue": orig_results['total_revenue'],
            "profit": orig_results['total_profit'],
            "margin_pct": orig_results['average_margin_pct']
        },
        "simulated": {
            "revenue": sim_profit_metrics['total_revenue'],
            "profit": sim_profit_metrics['total_profit'],
            "margin_pct": sim_profit_metrics['average_margin_pct']
        },
        "impact": {
            "revenue_change": round(sim_profit_metrics['total_revenue'] - orig_results['total_revenue'], 2),
            "profit_change": round(profit_diff, 2),
            "margin_change_pct": round(margin_diff, 2),
            "cash_unlocked_from_ar": round(cash_unlocked, 2)
        },
        "simulated_trend": sim_profit_metrics['monthly_trend']
    }
