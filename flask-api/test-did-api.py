import requests
import json
import time

# Test function
def test_did_api():
    # Setup
    api_key = "Basic dGVzdGdhdXJhdjkxMUBnbWFpbC5jb20:HChGiSC636Slw7dwZpusV"
    url = "https://api.d-id.com/talks"
    
    # Headers
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    # Payload
    payload = {
        "source_url": "https://cdn.getmerlin.in/cms/img_AQO_Pe_Pie_STC_59p_Oy_Zo8mbm7d_5a6a9d88fe.png",
        "script": {
            "type": "text",
            "input": "This is a test message to verify the D-ID API is working correctly."
        }
    }
    
    # Make request
    print("Sending request to D-ID...")
    response = requests.post(url, headers=headers, json=payload)
    
    # Print results
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text[:200]}")  # Print first 200 characters
    
    # If successful, poll for completion
    if response.status_code == 201:
        talk_id = response.json().get("id")
        print(f"Talk ID: {talk_id}")
        
        status_url = f"https://api.d-id.com/talks/{talk_id}"
        
        for i in range(15):
            print(f"Checking status (attempt {i+1})...")
            status_resp = requests.get(status_url, headers=headers)
            result = status_resp.json()
            status = result.get("status")
            print(f"Current status: {status}")
            
            if status == "done":
                print(f"Success! Video URL: {result.get('result_url')}")
                return True
            elif status == "error":
                print(f"Error: {result.get('error')}")
                return False
            
            time.sleep(2)
    else:
        print("Failed to create talk")
        return False
    



if __name__ == "__main__":
    test_did_api()