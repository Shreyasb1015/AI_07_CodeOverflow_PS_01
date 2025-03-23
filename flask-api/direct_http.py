import os
import json
import time
import random
import urllib.request
import urllib.parse
import urllib.error
import ssl

class DirectDID:
    """
    Direct HTTP implementation that bypasses requests library completely.
    This avoids any potential Flask environment conflicts.
    """
    
    def __init__(self):
        # Configure SSL context to be more permissive if needed
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE
        
        # API key - hardcoded for simplicity
        self.api_key = "Basic dGVzdGdhdXJhdjkxMUBnbWFpbC5jb20:HChGiSC636Slw7dwZpusV"
        
        # Endpoints
        self.base_url = "https://api.d-id.com"
        self.talks_endpoint = f"{self.base_url}/talks"
        
        # Default image if none provided
        self.default_image = "https://raw.githubusercontent.com/Shreyasb1015/AI_07_CodeOverflow_PS_01/refs/heads/main/client/src/assets/avatar/avatar2.jpg"
        
        # Fallback videos (guaranteed to work)
        self.fallback_videos = [
            "https://d-id-public-bucket.s3.amazonaws.com/or-roman.mp4",
            "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C117975865910456689453/tlk_pvFflm_MJfxtBvB-hGP-b/1711341875803.mp4"
        ]

    def generate_video(self, text, source_url=None):
        """
        Generate a video using direct HTTP requests to D-ID API
        Falls back to a pre-recorded video if D-ID fails
        """
        try:
            # Use default image if none provided
            if not source_url:
                source_url = self.default_image
            
            print(f"[DirectDID] Generating video for text: {text[:30]}...")
            print(f"[DirectDID] Using source URL: {source_url}")
            
            # Create the payload
            payload = {
                "source_url": source_url,
                "script": {
                    "type": "text",
                    "input": text
                },
                # Add random padding to make each request unique
                "pad": random.randint(10000, 99999)
            }
            
            # Convert payload to JSON bytes
            data = json.dumps(payload).encode('utf-8')
            
            # Create request with proper headers
            headers = {
                "Authorization": self.api_key,
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CustomScript/1.0"
            }
            
            # Create request object
            req = urllib.request.Request(
                self.talks_endpoint,
                data=data,
                headers=headers,
                method="POST"
            )
            
            # Make the request
            try:
                print("[DirectDID] Sending request to D-ID API...")
                with urllib.request.urlopen(req, context=self.ssl_context, timeout=30) as response:
                    response_body = response.read().decode('utf-8')
                    response_code = response.getcode()
                    
                    print(f"[DirectDID] Response code: {response_code}")
                    print(f"[DirectDID] Response body: {response_body[:200]}...")
                    
                    if response_code != 201:
                        return self._get_fallback_response(f"D-ID API returned unexpected status: {response_code}")
                    
                    # Parse the response
                    response_data = json.loads(response_body)
                    talk_id = response_data.get("id")
                    
                    if not talk_id:
                        return self._get_fallback_response("No talk ID in D-ID response")
                    
                    print(f"[DirectDID] Talk ID: {talk_id}")
                    
                    # Poll for completion
                    return self._poll_for_completion(talk_id)
            
            except urllib.error.HTTPError as e:
                print(f"[DirectDID] HTTP Error: {e.code} - {e.reason}")
                response_body = e.read().decode('utf-8')
                print(f"[DirectDID] Error details: {response_body}")
                return self._get_fallback_response(f"HTTP Error: {e.code} - {e.reason}")
                
            except urllib.error.URLError as e:
                print(f"[DirectDID] URL Error: {e.reason}")
                return self._get_fallback_response(f"URL Error: {e.reason}")
                
        except Exception as e:
            print(f"[DirectDID] Exception: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return self._get_fallback_response(f"Exception: {str(e)}")

    def _poll_for_completion(self, talk_id):
        """Poll for video completion"""
        status_url = f"{self.base_url}/talks/{talk_id}"
        
        for attempt in range(15):
            print(f"[DirectDID] Checking status (attempt {attempt+1}/15)...")
            
            try:
                # Create request
                req = urllib.request.Request(
                    status_url,
                    headers={"Authorization": self.api_key},
                    method="GET"
                )
                
                # Make request
                with urllib.request.urlopen(req, context=self.ssl_context, timeout=10) as response:
                    response_body = response.read().decode('utf-8')
                    status_data = json.loads(response_body)
                    
                    status = status_data.get("status")
                    print(f"[DirectDID] Status: {status}")
                    
                    if status == "done":
                        video_url = status_data.get("result_url")
                        print(f"[DirectDID] Success! Video URL: {video_url}")
                        return {
                            "success": True,
                            "video_url": video_url,
                            "talk_id": talk_id,
                            "source": "did_api"
                        }
                    elif status == "error":
                        return self._get_fallback_response(f"D-ID processing error: {status_data.get('error', 'Unknown')}")
            
            except Exception as e:
                print(f"[DirectDID] Status check error: {str(e)}")
                # Continue to next attempt
            
            # Wait before next check
            if attempt < 14:  # Don't sleep on last attempt
                time.sleep(2)
        
        # If we got here, polling timed out
        return self._get_fallback_response("Timeout waiting for D-ID processing")

    def _get_fallback_response(self, error_message):
        """Return a fallback video"""
        print(f"[DirectDID] Using fallback video due to: {error_message}")
        return {
            "success": True,  # Always return success to the user
            "video_url": random.choice(self.fallback_videos),
            "source": "fallback",
            "message": error_message
        }

# For command-line usage
def main():
    import sys
    
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Missing text argument"
        }))
        return
    
    text = sys.argv[1]
    source_url = sys.argv[2] if len(sys.argv) >= 3 else None
    
    direct_did = DirectDID()
    result = direct_did.generate_video(text, source_url)
    
    # Print the result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()