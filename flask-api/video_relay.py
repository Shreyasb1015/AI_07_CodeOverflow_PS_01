import os
import sys
import subprocess
import json

def main():
    """
    Simple relay script that runs did_video_standalone.py with complete isolation from Flask
    """
    # Get arguments
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Missing text argument"
        }))
        return
    
    # Extract arguments
    text = sys.argv[1]
    source_url = sys.argv[2] if len(sys.argv) >= 3 else None
    
    # Build command to run the standalone script that's known to work
    cmd = ["python", os.path.join(os.path.dirname(os.path.abspath(__file__)), "did_video_standalone.py"), text]
    if source_url:
        cmd.append(source_url)
    
    # Run the command with a completely fresh environment
    process = subprocess.run(
        cmd, 
        capture_output=True, 
        text=True,
        env={
            # Only pass essential environment variables
            "PATH": os.environ.get("PATH", ""),
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", ""),
            "TEMP": os.environ.get("TEMP", ""),
            "TMP": os.environ.get("TMP", "")
        }
    )
    
    # Output exactly what the script returned
    print(process.stdout)

if __name__ == "__main__":
    main()