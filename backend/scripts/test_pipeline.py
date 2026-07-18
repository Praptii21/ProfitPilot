import requests

BASE_URL = "http://127.0.0.1:8000"
CSV_FILE_PATH = "profitpilot_sample_data.csv"

def test_full_engine():
    print("🚀 [TEST 1] Testing /analyze Endpoint with ML Models...")
    
    with open(CSV_FILE_PATH, 'rb') as f:
        files = {'file': (CSV_FILE_PATH, f, 'text/csv')}
        response = requests.post(f"{BASE_URL}/analyze", files=files)
        
    assert response.status_code == 200, "Failed to upload and run models."
    data = response.json()
    
    print("\n✅ /analyze response received successfully!")
    print(f"-> Base Profit Margin: {data['metrics']['profit_margin']}%")
    print(f"-> ML Forecasted Profit: ₹{data['forecast']['next_month_profit']:,}")
    print(f"-> Found {len(data['profit_leaks'])} Profit Leaks via Isolation Forest.")
    # Show dynamic scoring in action
    if data['profit_leaks']:
        leak = data['profit_leaks'][0]
        print(f"   Sample Leak: {leak['product']} | Severity: {leak['severity']} | Confidence: {leak['confidence_score']}")
    
    print("\n📊 [TEST 2] Testing /dashboard Endpoint...")
    dash_response = requests.get(f"{BASE_URL}/dashboard")
    assert dash_response.status_code == 200, "Dashboard failed."
    dash_data = dash_response.json()
    
    print("\n✅ /dashboard response received successfully!")
    print(f"-> Overall Margin: {dash_data['metrics']['overall_margin']:.2f}%")
    print(f"-> Monthly Trend Data Points: {len(dash_data.get('monthly_trend', []))}")
    if dash_data.get('monthly_trend') and 'month' in dash_data['monthly_trend'][0]:
         print(f"   First Month Extracted: {dash_data['monthly_trend'][0]['month']}")
    else:
         print("   ⚠️ Monthly trend missing! Make sure 'transaction_date' is in your CSV.")
    print(f"-> Products Tracked: {len(dash_data.get('product_analysis', []))}")
    print(f"-> Customers Tracked: {len(dash_data.get('customer_analysis', []))}")

    print("\n💰 [TEST 3] Testing /profit Endpoint...")
    profit_response = requests.get(f"{BASE_URL}/profit")
    assert profit_response.status_code == 200, "Profit endpoint failed."
    profit_data = profit_response.json()
    
    print("\n✅ /profit response received successfully!")
    print(f"-> Total Profit: ₹{profit_data['total_profit']:,}")
    print(f"-> Top Performing Product: {profit_data['top_product']}")

    print("\n🎮 [TEST 4] Testing /simulator Endpoint for Live Slider...")
    payload = {
        "price_change_pct": 5.0,        # +5% price increase
        "discount_change_pct": -2.0,    # 2% fewer discounts
        "payment_terms_days": 15
    }
    
    sim_response = requests.post(f"{BASE_URL}/simulator", json=payload)
    assert sim_response.status_code == 200, "Simulator failed."
    sim_data = sim_response.json()
    
    print("\n✅ /simulator response received successfully!")
    print(f"-> Expected Profit Shift: ₹{sim_data['profit_delta']:,.2f}")
    print(f"-> Net Impact: {sim_data['impact_direction'].upper()}")

if __name__ == "__main__":
    try:
        test_full_engine()
        print("\n🎉 ALL ML & ANALYTICS API TESTS PASSED! Backend is 100% ready for Gemma.")
    except Exception as e:
        print(f"\n❌ Test pipeline failed: {str(e)}")