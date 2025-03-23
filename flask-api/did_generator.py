import os
import sys
import json
import time
import subprocess
import tempfile

def generate_video(text, source_url=None):
    """
    Generate a video using D-ID API with curl commands
    This bypasses any potential issues with the requests library
    """
    print("Starting D-ID video generation through standalone script")
    
    # Default if not provided
    if not source_url:
        source_url = "https://cdn.getmerlin.in/cms/img_AQO_Pe_Pie_STC_59p_Oy_Zo8mbm7d_5a6a9d88fe.png"
    
    # Create a temporary file for the request payload
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp:
        payload = {
            "source_url": source_url,
            "script": {
                "type": "text",
                "input": text
            }
        }
        json.dump(payload, temp)
        payload_file = temp.name
    
    # API key
    api_key = "Basic dGVzdGdhdXJhdjkxMUBnbWFpbC5jb20:HChGiSC636Slw7dwZpusV"
    
    # Use curl to make the initial request
    curl_command = [
        "curl", "-s",
        "-H", f"Authorization: {api_key}",
        "-H", "Content-Type: application/json",
        "-d", f"@{payload_file}",
        "https://api.d-id.com/talks"
    ]
    
    print(f"Running curl command: {' '.join(curl_command)}")
    
    try:
        # Execute curl command
        response = subprocess.run(curl_command, capture_output=True, text=True)
        print(f"Curl response status: {response.returncode}")
        print(f"Curl response body: {response.stdout[:200]}")
        
        if response.returncode != 0:
            print(f"Curl error: {response.stderr}")
            return {
                "success": False,
                "error": "Curl command failed",
                "details": response.stderr
            }
        
        # Parse the response JSON
        try:
            response_data = json.loads(response.stdout)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON response: {response.stdout}")
            return {
                "success": False,
                "error": "Failed to parse response JSON",
                "details": response.stdout
            }
        
        # Get talk ID
        talk_id = response_data.get("id")
        if not talk_id:
            print("No talk ID in response")
            return {
                "success": False,
                "error": "No talk ID in response",
                "details": response_data
            }
        
        print(f"Talk ID: {talk_id}")
        
        # Poll for completion with curl
        status_url = f"https://api.d-id.com/talks/{talk_id}"
        
        for attempt in range(15):
            print(f"Status check attempt {attempt+1}/15")
            
            # Use curl to check status
            status_command = [
                "curl", "-s",
                "-H", f"Authorization: {api_key}",
                status_url
            ]
            
            status_response = subprocess.run(status_command, capture_output=True, text=True)
            
            if status_response.returncode != 0:
                print(f"Status check curl error: {status_response.stderr}")
                continue  # Try again rather than failing
            
            try:
                status_data = json.loads(status_response.stdout)
                status = status_data.get("status")
                print(f"Status: {status}")
                
                if status == "done":
                    video_url = status_data.get("result_url")
                    print(f"Video generated successfully: {video_url}")
                    return {
                        "success": True,
                        "video_url": video_url,
                        "talk_id": talk_id
                    }
                elif status == "error":
                    print(f"Error creating video: {status_data.get('error')}")
                    return {
                        "success": False,
                        "error": f"Video generation failed: {status_data.get('error')}",
                        "details": status_data
                    }
            except json.JSONDecodeError:
                print(f"Failed to parse status JSON: {status_response.stdout}")
            
            # Wait before next check
            if attempt < 14:
                time.sleep(2)
        
        return {
            "success": False,
            "error": "Timeout waiting for video generation",
            "talk_id": talk_id
        }
    
    finally:
        # Clean up temp file
        try:
            os.unlink(payload_file)
        except:
            pass

if __name__ == "__main__":
    # Run directly with arguments
    if len(sys.argv) >= 2:
        text = sys.argv[1]
        source_url = sys.argv[2] if len(sys.argv) >= 3 else None
        result = generate_video(text, source_url)
        print(json.dumps(result))
    else:
        print("Usage: python did_video_standalone.py \"Text for the video\" [source_url]")
        sys.exit(1)
        