import requests

# Path to the image you want to test (e.g., a photo of a receipt or invoice)
# Make sure you place an image file like 'invoice_sample.jpg' in your folder!
IMAGE_PATH = "invoice_sample.jpg" 
BASE_URL = "http://127.0.0.1:8000"

def test_vision_pipeline():
    print(f"📷 [TEST] Sending {IMAGE_PATH} to /extract endpoint...")
    
    try:
        with open(IMAGE_PATH, 'rb') as f:
            files = {'file': (IMAGE_PATH, f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/extract", files=files)
            
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Extraction Success!")
            print(f"-> Extracted {len(data['analysis']['profit_leaks'])} Profit Leaks via Vision.")
            print(f"-> Forecasted Next Month Profit: ₹{data['analysis']['forecast']['next_month_profit']:,}")
        else:
            print(f"\n❌ Server Error: {response.status_code}")
            print(response.json())
            
    except FileNotFoundError:
        print(f"\n⚠️ Error: Please put an image file named '{IMAGE_PATH}' in this folder.")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")

if __name__ == "__main__":
    test_vision_pipeline()