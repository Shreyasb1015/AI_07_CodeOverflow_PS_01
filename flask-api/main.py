import re
import time
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import SecretStr
from PIL import Image
import pytesseract
import io
import chromadb
from chromadb.config import Settings
import shutil
import requests
from create_knoweldge_base import create_knowledge_base_fn
from fetch_from_knoweldge_base import fetch_from_knowledge_base
import json
import base64
import cv2
import numpy as np
from deepface import DeepFace
from collections import Counter
import time
from threading import Lock
from flask import session
import whisper



app = Flask(__name__)
CORS(app,supports_credentials=True)
load_dotenv()
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
HUGGINGFACE_API_TOKEN=os.getenv("HUGGING_FACE_TOKEN")
emotion_frames = {}  
emotion_locks = {}   

@app.route('/chat', methods=['POST'])
def chat():
    user_input=request.json.get("user_input", "") # type: ignore
    if user_input:
        model=ChatGoogleGenerativeAI(model="gemini-2.0-flash",api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None)
        result = model.invoke(user_input).content
        cleaned_result = re.sub(r'(\*\*|\*|\n\n|\n)', '', str(result))
        return jsonify({"response": cleaned_result})  
    else:
        return jsonify({"response": "Please provide user input"})


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
@app.route('/ocr', methods=['POST'])
def ocr():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in request'}), 400

    image_file = request.files['image']
    
    if image_file.filename == '':
        return jsonify({'error': 'No selected image'}), 400

    image = Image.open(image_file.stream)
    text = pytesseract.image_to_string(image)
    
    return jsonify({'text': text})
    

@app.route('/update_knowledge_base', methods=['POST'])
def update_knowledge_base():
    try:
        if 'pdf' not in request.files:
            return jsonify({'error': 'No PDF file in request'}), 400

        pdf_file = request.files['pdf']
        
        if pdf_file.filename == '':
            return jsonify({'error': 'No selected PDF file'}), 400
        
     
        current_dir = os.path.dirname(os.path.abspath(__file__))
        db_dir = os.path.join(current_dir, "db")
        pdf_path = os.path.join(db_dir, "hack-faq.pdf")
        persistent_directory = os.path.join(db_dir, "chroma_db")
    
        os.makedirs(db_dir, exist_ok=True)
    
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            print(f"Removed existing PDF file: {pdf_path}")
        
        pdf_file.save(pdf_path)
        print(f"Saved new PDF file to: {pdf_path}")
        
        
        if os.path.exists(persistent_directory):
            shutil.rmtree(persistent_directory)
            print(f"Removed existing vector store directory: {persistent_directory}")
    
        success = create_knowledge_base_fn()
        
        if success:
            return jsonify({
                'status': 'success', 
                'message': 'Knowledge base updated successfully'
            })
        else:
            return jsonify({
                'status': 'error', 
                'message': 'Failed to update knowledge base'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error updating knowledge base: {str(e)}'
        }), 500


MY_PROMPT="""
You are an intelligent and professional virtual assistant for the IDMS ERP System, designed specifically for manufacturing industries. Your role is to act as a knowledgeable help desk, assisting users with queries related to Sales, Purchase, Inventory, Production, Quality Control, Dispatch, Finance, and GST compliance.

Your responses must be clear, concise, and structured based on the IDMS ERP database. When answering queries, please follow these guidelines:

1. Provide precise and informative answers, avoiding unnecessary details.
2. Refer to relevant ERP modules, transactions, reports, and dependencies where applicable.
3. Offer step-by-step guidance for using ERP functionalities.
4. Explain GST compliance rules and their implementation in IDMS, including invoices, returns, and reconciliation.
5. Troubleshoot common user issues within the system.

Your output must always be structured in JSON format as follows:

{
  "response_code": "200",
  "content": "Your detailed response goes here, answering the user's query.",
  "module_reference": "Relevant ERP module name (if applicable)",
  "related_transactions": ["List of relevant transactions"],
  "suggested_reports": ["List of relevant reports"]
}

Handling Security & Inappropriate Queries:
If a user asks a security-sensitive question (e.g., access credentials, hacking attempts) or an inappropriate question (e.g., offensive language, unrelated topics), respond in the following format:

{
  "response_code": "403",
  "content": "Your query violates security or ethical guidelines. Please ask a relevant question related to IDMS ERP.",
  "module_reference": null,
  "related_transactions": [],
  "suggested_reports": []
}

Guiding the User for Better Queries:
If a user query is vague, ask for clarification before responding using this format:

{
  "response_code": "422",
  "content": "Could you please specify which module or process you are referring to? This will help me provide a precise answer.",
  "module_reference": null,
  "related_transactions": [],
  "suggested_reports": []
}

Response Code Legend:
- 200 → Success (Valid query, response provided)
- 403 → Forbidden (Security-related or inappropriate query)
- 422 → Unprocessable (Query is vague and needs clarification)

Always maintain a friendly, professional, and solution-oriented tone. When a user asks about a process (e.g., "How do I generate a GST invoice?"), explain it step by step. When a user asks for insights (e.g., "How does IDMS handle stock aging?"), provide the relevant reports along with their purpose.

Prioritize accuracy and efficiency in resolving queries. Your structured responses with response codes will help the chatbot system integrate automated actions, improve debugging, and streamline logging.

End of prompt.
"""

@app.route('/chatting', methods=['POST'])
def chatting():
    user_input = request.json.get("user_input", "")  # type: ignore

    if not user_input:
        return jsonify({"response": "Please provide user input"})
    
    try:

        docs = fetch_from_knowledge_base(user_input)
        
        if not docs or len(docs) == 0:
           
            model = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
            )
            full_prompt = f"{MY_PROMPT}\n\nUser Query: {user_input}\n\nProvide a response in the JSON format specified above."
            result = model.invoke(full_prompt).content
            cleaned_result = clean_text_content(str(result))
            
            try:
                parsed_result = json.loads(cleaned_result)
            except Exception:
                parsed_result = {
                    "response_code": "200",
                    "content": cleaned_result,
                    "module_reference": None,
                    "related_transactions": [],
                    "suggested_reports": []
                }
            return jsonify({"response": parsed_result, "source_docs": []})
        
        doc_contents = [clean_text_content(doc.page_content) for doc in docs]
        doc_sources = [doc.metadata.get('source', 'Unknown') if doc.metadata else 'Unknown' for doc in docs]
        
       
        formatted_docs = '\n\n'.join(doc_contents)
        
        enhanced_prompt = f"""
Based on the following information from our knowledge base:
{'-' * 30}
{formatted_docs}
{'-' * 30}

Please answer the user's query: "{user_input}"

Use only the information provided above to answer the query. If the information is not sufficient 
to provide a complete answer, please state what is known from the provided context and indicate 
what information is missing.
"""

        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
        )
        result = model.invoke(enhanced_prompt).content
        cleaned_result = clean_text_content(str(result))
        
        try:
            result_json = json.loads(cleaned_result)
        except Exception:
            result_json = {
                "response_code": "200",
                "content": cleaned_result,
                "module_reference": None,
                "related_transactions": [],
                "suggested_reports": []
            }
            
        
        clean_doc_contents = [clean_text_content(doc.page_content) for doc in docs]
        
        response_data = {
            "response": result_json,
            "source_docs": [
                {"content": clean_doc_contents[i], "source": doc_sources[i]} for i in range(len(clean_doc_contents))
            ]
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({"response": {"response_code": "500", "content": f"An error occurred: {str(e)}", "module_reference": None, "related_transactions": [], "suggested_reports": []}, "source_docs": []})


def clean_text_content(text):
    
    code_block_pattern = r'```(?:json)?\s*(\{[\s\S]*?\})\s*```'
    code_match = re.search(code_block_pattern, text)
    if code_match:
      
        json_content = code_match.group(1)
       
        json_content = json_content.replace('\\"', '"')
        return json_content


    cleaned = text.replace('\\n', ' ').replace('\\t', ' ')
    cleaned = re.sub(r'\*\*|\*', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    
    cleaned = cleaned.replace('\\"', '"')  
    cleaned = cleaned.replace('\\\\', '\\')  
    
    cleaned = cleaned.replace('\\*', '•')
    cleaned = cleaned.replace('\\r', ' ')
    cleaned = re.sub(r'\\([^"\\])', r'\1', cleaned)
    
    return cleaned.strip()

@app.route('/generate-video', methods=['POST'])
def generate_and_fetch_video():
    try:
        print("Video generation request received")
        
        # Get input data
        data = request.get_json(silent=True)
        print(f"Request data: {data}")
        
        # Set defaults for required fields
        if data is not None:
            input_text = data.get('text')
            source_url = data.get('source_url')
        else:
            input_text = request.form.get('text')
            source_url = request.form.get('source_url')
        
        # Use defaults if not provided
        if not input_text:
            input_text = "Hello! This is a test video generated by the application."
        
        # Execute the standalone script that we know works
        import subprocess
        import json
        
        cmd = ["python", "did_generator.py", input_text]
        if source_url:
            cmd.append(source_url)
            
        print(f"Running command: {' '.join(cmd)}")
        
        # Run the script and capture its output
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Check if script executed successfully
        if result.returncode == 0:
            try:
                # Parse the JSON output from the script
                script_output = result.stdout.strip()
                print(f"Script output: {script_output}")
                
                video_data = json.loads(script_output)
                
                if video_data.get("success"):
                    # If script successfully generated a video
                    return jsonify(video_data)
                else:
                    # Script ran but D-ID API had an issue
                    print(f"Script reported error: {video_data.get('error')}")
            except json.JSONDecodeError:
                print(f"Failed to parse script output: {result.stdout}")
                print(f"Error output: {result.stderr}")
        else:
            # Script failed to execute
            print(f"Script execution failed with code {result.returncode}")
            print(f"Error output: {result.stderr}")
        
        # If we got here, something went wrong - use fallback
        print("Using fallback video")
        return jsonify({
            "success": True,
            "video_url": "https://d-id-public-bucket.s3.amazonaws.com/or-roman.mp4",
            "source": "fallback",
            "message": "Using fallback video due to generation issues"
        })
            
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Exception in video generation: {str(e)}")
        print(traceback_str)
        
        # Always provide a fallback video
        return jsonify({
            "success": True,
            "video_url": "https://d-id-public-bucket.s3.amazonaws.com/or-roman.mp4",
            "source": "exception_fallback",
            "message": "Using fallback video due to an unexpected error"
        })

@app.route('/api/d-id/talks', methods=['POST'])
def proxy_create_talk():
    """Proxy endpoint for D-ID API talk creation"""
    try:
        # Get the request data from the frontend
        data = request.json
        print(f"Received request data: {data}")

        # Forward the request to the D-ID API
        response = requests.post(
            "https://api.d-id.com/talks",
            headers={
                'Authorization': 'Basic YmFnd2VzaHJleWFzMTAxNUBnbWFpbC5jb20:cyHc6ebyVGf-GE5oLUiqR',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json=data,
            timeout=30
        )

        # Log the response from the D-ID API
        print(f"D-ID API response status: {response.status_code}")
        print(f"D-ID API response body: {response.text}")

        # Return the response from the D-ID API to the frontend
        print("Response",response)
        return jsonify(response.json()), response.status_code

    except Exception as e:
        print(f"Error in proxy_create_talk: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/d-id/talks/<talk_id>', methods=['GET'])
def proxy_get_talk_status(talk_id):
    """Proxy endpoint for D-ID API talk status check"""
    try:
        # Poll the D-ID API for the status of the talk
        response = requests.get(
            f"https://api.d-id.com/talks/{talk_id}",
            headers={
                'Authorization': 'Basic YmFnd2VzaHJleWFzMTAxNUBnbWFpbC5jb20:cyHc6ebyVGf-GE5oLUiqR',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=30
        )

        # Log the response from the D-ID API
        print(f"D-ID API status response status: {response.status_code}")
        print(f"D-ID API status response body: {response.text}")

        # Return the response from the D-ID API to the frontend
        return jsonify(response.json()), response.status_code

    except Exception as e:
        print(f"Error in proxy_get_talk_status: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/image-chat', methods=['POST'])
def image_chat():
    try:
        if 'image' not in request.files:
            return jsonify({
                "response": {
                    "response_code": "422", 
                    "content": "Please provide an image file", 
                    "module_reference": None, 
                    "related_transactions": [], 
                    "suggested_reports": []
                }, 
                "source_docs": []
            })

        image_file = request.files['image']
        user_input = request.form.get("user_input", "Analyze this image")
        
        if image_file.filename == '':
            return jsonify({
                "response": {
                    "response_code": "422", 
                    "content": "No selected image file", 
                    "module_reference": None, 
                    "related_transactions": [], 
                    "suggested_reports": []
                }, 
                "source_docs": []
            })

        image_content = image_file.read()
        image = Image.open(io.BytesIO(image_content))
        
        base64_image = base64.b64encode(image_content).decode('utf-8')
        
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-pro-exp-02-05",  
            api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
        )
        
        full_prompt = f"{MY_PROMPT}\n\nUser Query with Image: {user_input}\n\nProvide a response in the JSON format specified above based on the image content."
        
        try:
           
            text_content = pytesseract.image_to_string(image)
            
            if len(text_content) > 50:
                docs = fetch_from_knowledge_base(text_content)
                
                if docs and len(docs) > 0:
                    doc_contents = [clean_text_content(doc.page_content) for doc in docs]
                    doc_sources = [doc.metadata.get('source', 'Unknown') if doc.metadata else 'Unknown' for doc in docs]
                    formatted_docs = '\n\n'.join(doc_contents)
                    enhanced_prompt = f"""
Based on the following information from our knowledge base:
{'-' * 30}
{formatted_docs}
{'-' * 30}

Please analyze this image and answer the query: "{user_input}"

Consider both the image content and the knowledge base information in your response.
"""
                    
                    messages = [
                        {"role": "user", "content": enhanced_prompt},
                        {"role": "user", "content": [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]}
                    ]
                    
                    result = model.invoke(messages).content
                    
                    cleaned_result = clean_text_content(str(result))
                    
                    try:
                        result_json = json.loads(cleaned_result)
                    except Exception:
                        result_json = {
                            "response_code": "200",
                            "content": cleaned_result,
                            "module_reference": None,
                            "related_transactions": [],
                            "suggested_reports": []
                        }
                        
                    clean_doc_contents = [clean_text_content(doc.page_content) for doc in docs]
                    
                    response_data = {
                        "response": result_json,
                        "source_docs": [
                            {"content": clean_doc_contents[i], "source": doc_sources[i]} for i in range(len(clean_doc_contents))
                        ]
                    }
                    
                    return jsonify(response_data)
            
        except Exception as e:
            print(f"Error during knowledge base lookup: {str(e)}")
            
        messages = [
            {"role": "user", "content": full_prompt},
            {"role": "user", "content": [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]}
        ]
        
        result = model.invoke(messages).content
        
        cleaned_result = clean_text_content(str(result))
        
        try:
            parsed_result = json.loads(cleaned_result)
        except Exception:
            parsed_result = {
                "response_code": "200",
                "content": cleaned_result,
                "module_reference": None,
                "related_transactions": [],
                "suggested_reports": []
            }
            
        return jsonify({"response": parsed_result, "source_docs": []})
        
    except Exception as e:
        import traceback
        traceback.print_exc()  
        return jsonify({
            "response": {
                "response_code": "500", 
                "content": f"An error occurred processing the image: {str(e)}", 
                "module_reference": None, 
                "related_transactions": [], 
                "suggested_reports": []
            }, 
            "source_docs": []
        })
        
@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image part in request'}), 400

        image_file = request.files['image']
        
       
        client_ip = request.remote_addr
        user_agent = request.headers.get('User-Agent', 'Unknown')
        
    
        client_cookie = request.cookies.get('session_tracker')
        if client_cookie:
            session_id = f"{client_cookie}"
        else:
            import uuid
            session_id = f"session_{uuid.uuid4().hex[:10]}"
            
        token = request.form.get('token', 'continue')  
        user_input = request.form.get('user_input', '')  
        print(token)
        print(user_input)   
        
        if image_file.filename == '':
            return jsonify({'error': 'No selected image'}), 400
            
        if session_id not in emotion_frames:
            emotion_locks[session_id] = Lock()
            emotion_frames[session_id] = []
            print(f"Created new emotion session: {session_id}")
                    
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        try:
            analysis = DeepFace.analyze(
                img_path=img,
                actions=['emotion'],
                enforce_detection=False, 
                detector_backend='opencv'  
            )
            
            if isinstance(analysis, list) and len(analysis) > 0:
                dominant_emotion = analysis[0]['dominant_emotion']
                emotion_score = analysis[0]['emotion'][dominant_emotion]
            else:
                dominant_emotion = 'unknown'
                emotion_score = 0
                
        except Exception as e:
            print(f"Error in emotion detection: {e}")
            dominant_emotion = 'unknown'
            emotion_score = 0
        
        with emotion_locks[session_id]:
            emotion_frames[session_id].append({
                'emotion': dominant_emotion,
                'score': emotion_score,
                'timestamp': time.time()
            })
            
            if len(emotion_frames[session_id]) > 20:  
                emotion_frames[session_id] = emotion_frames[session_id][-20:]
        print(token)
        print(user_input)
        if token == 'end' and user_input:
            print(token)
            response = process_final_frame(session_id, user_input, img)
            print("Got response from func")
            print(response)
            response.set_cookie('session_tracker', session_id, max_age=1800)  
            return response
        
        response = jsonify({
            'success': True,
            'session_id': session_id, 
            'detected_emotion': dominant_emotion,
            'frame_processed': True
        })
        response.set_cookie('session_tracker', session_id, max_age=1800)  
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error analyzing frame: {str(e)}'
        }), 500
        
        
def process_final_frame(session_id, user_input, final_frame_img):
    try:

        with emotion_locks[session_id]:
            collected_emotions = emotion_frames[session_id].copy()
            emotion_frames[session_id] = []
        
        valid_emotions = [e['emotion'] for e in collected_emotions if e['emotion'] != 'unknown']
        
        if valid_emotions:
            emotion_counts = Counter(valid_emotions)
            dominant_emotion = emotion_counts.most_common(1)[0][0]
            confidence = emotion_counts[dominant_emotion] / len(valid_emotions)
        else:
            dominant_emotion = 'neutral'
            confidence = 1.0
            
        print(f"Final emotion assessment - {dominant_emotion} (confidence: {confidence:.2f})")
        
        emotion_context = {
            'happy': "The user appears to be in a positive mood. Use an encouraging and enthusiastic tone.",
            'sad': "The user appears sad. Use a supportive and empathetic tone.",
            'angry': "The user appears frustrated or angry. Use a calm and solution-focused tone.",
            'fear': "The user appears concerned or anxious. Use a reassuring tone and provide clear guidance.",
            'disgust': "The user appears dissatisfied. Address their concerns professionally and offer solutions.",
            'surprise': "The user appears surprised. Provide thorough explanations.",
            'neutral': "The user appears neutral. Use a balanced, informative tone."
        }
        
        emotion_guidance = emotion_context.get(dominant_emotion, emotion_context['neutral'])
        
        docs = fetch_from_knowledge_base(user_input)
        
        if not docs or len(docs) == 0:
            model = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
            )
            
            full_prompt = f"""{MY_PROMPT}

User Query: {user_input}

User's Emotional State: {dominant_emotion}
Emotional Guidance: {emotion_guidance}

IMPORTANT: Your response must strictly adhere to the JSON format specified above. Do not change the structure of the JSON output under any circumstances. Ensure that the response includes:
- "response_code" (e.g., "200", "403", "422")
- "content" (the detailed response to the user's query, including the detected emotion explicitly)
- "module_reference" (if applicable, or null)
- "related_transactions" (a list of relevant transactions, or an empty list)
- "suggested_reports" (a list of relevant reports, or an empty list)

Adopt your tone to match the user's emotional state in the "content" field and explicitly mention the detected emotion in the "content" field. For example:
- If the user is happy, start with "Oh, you look happy today! Here's the information you need: ..."
- If the user is sad, start with "Oh, you look sad today. Let me help you with this: ..."

Provide the response in the exact JSON format specified above.
"""
            
            result = model.invoke(full_prompt).content
            cleaned_result = clean_text_content(str(result))
            
            try:
                parsed_result = json.loads(cleaned_result)
                
                parsed_result['detected_emotion'] = dominant_emotion
                parsed_result['emotion_confidence'] = confidence
                
            except Exception:
                parsed_result = {
                    "response_code": "200",
                    "content": cleaned_result,
                    "module_reference": None,
                    "related_transactions": [],
                    "suggested_reports": [],
                    "detected_emotion": dominant_emotion,
                    "emotion_confidence": confidence
                }
                
            return jsonify({
                "response": parsed_result, 
                "source_docs": [],
                "emotion_analysis": {
                    "dominant_emotion": dominant_emotion,
                    "confidence": confidence,
                    "emotion_counts": dict(emotion_counts) if valid_emotions else {"neutral": 1}
                }
            })
        
        doc_contents = [clean_text_content(doc.page_content) for doc in docs]
        doc_sources = [doc.metadata.get('source', 'Unknown') if doc.metadata else 'Unknown' for doc in docs]
        
        formatted_docs = '\n\n'.join(doc_contents)
        
        enhanced_prompt = f"""
Based on the following information from our knowledge base:
{'-' * 30}
{formatted_docs}
{'-' * 30}

Please answer the user's query: "{user_input}"

User's Emotional State: {dominant_emotion}
Emotional Guidance: {emotion_guidance}

Give the answer to user question while keeping in mind the user's emotional state.
Use only the information provided above to answer the query, while adapting your tone to match the user's emotional state.
If the information is not sufficient to provide a complete answer, please state what is known from the provided context 
and indicate what information is missing.
"""

        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
        )
        
        result = model.invoke(enhanced_prompt).content
        cleaned_result = clean_text_content(str(result))
        
        try:
            result_json = json.loads(cleaned_result)
            
            result_json['detected_emotion'] = dominant_emotion
            result_json['emotion_confidence'] = confidence
            
        except Exception:
            result_json = {
                "response_code": "200",
                "content": cleaned_result,
                "module_reference": None,
                "related_transactions": [],
                "suggested_reports": [],
                "detected_emotion": dominant_emotion,
                "emotion_confidence": confidence
            }
        
        clean_doc_contents = [clean_text_content(doc.page_content) for doc in docs]
        
        response_data = {
            "response": result_json,
            "source_docs": [
                {"content": clean_doc_contents[i], "source": doc_sources[i]} for i in range(len(clean_doc_contents))
            ],
            "emotion_analysis": {
                "dominant_emotion": dominant_emotion,
                "confidence": confidence,
                "emotion_counts": dict(emotion_counts) if valid_emotions else {"neutral": 1}
            }
        }
        print("Returning response data")
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "response": {
                "response_code": "500", 
                "content": f"An error occurred: {str(e)}", 
                "module_reference": None, 
                "related_transactions": [], 
                "suggested_reports": [],
                "detected_emotion": "unknown"
            },
            "source_docs": [],
            "emotion_analysis": {
                "error": str(e)
            }
        }), 500



@app.before_request
def cleanup_old_sessions():
    try:
        current_time = time.time()
        sessions_to_remove = []
        
        for session_id, lock in emotion_locks.items():
            if lock.acquire(blocking=False):
                try:
                    if session_id in emotion_frames and emotion_frames[session_id]:
                        last_frame_time = max(frame['timestamp'] for frame in emotion_frames[session_id])
                        
                       
                        if current_time - last_frame_time > 1800:  
                            sessions_to_remove.append(session_id)
                    else:
                       
                        sessions_to_remove.append(session_id)
                finally:
                    lock.release()
        
        for session_id in sessions_to_remove:
            if session_id in emotion_frames:
                del emotion_frames[session_id]
            if session_id in emotion_locks:
                del emotion_locks[session_id]
    except Exception as e:
        print(f"Error during session cleanup: {e}")
        
        
    

HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h"
HEADERS = {
    "Authorization": f"Bearer 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"
}

def transcribe_audio(audio_bytes):
    response = requests.post(HUGGINGFACE_API_URL, headers=HEADERS, data=audio_bytes)
    if response.status_code == 200:
        try:
            return response.json()
        except Exception as e:
            return {"error": "Failed to parse response JSON", "details": str(e)}
    else:
        return {"error": f"Hugging Face API Error {response.status_code}", "details": response.text}

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided. Use form-data with key 'audio'."}), 400

    audio_file = request.files['audio']
    audio_bytes = audio_file.read()

    try:
        # Save the audio to a temporary file
        temp_audio_path = "temp_audio.wav"
        with open(temp_audio_path, "wb") as f:
            f.write(audio_bytes)

        # Load the Whisper model
        model = whisper.load_model("base")  # Use "small", "medium", or "large" for better accuracy

        # Transcribe the audio
        result = model.transcribe(temp_audio_path)
        transcription_text = result.get("text", "").strip()

        if not transcription_text or len(transcription_text) < 3:
            return jsonify({
                "response": {
                    "response_code": "422",
                    "content": "The transcribed audio was too short or couldn't be understood. Please try again.",
                    "module_reference": None,
                    "related_transactions": [],
                    "suggested_reports": []
                },
                "source_docs": [],
                "transcription": {"text": transcription_text}
            }), 422

        print(f"Transcribed text: {transcription_text}")
        docs = fetch_from_knowledge_base(transcription_text)

        if not docs or len(docs) == 0:
            model = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
            )
            full_prompt = f"{MY_PROMPT}\n\nUser Query (from speech): {transcription_text}\n\nProvide a response in the JSON format specified above."
            result = model.invoke(full_prompt).content
            cleaned_result = clean_text_content(str(result))

            try:
                parsed_result = json.loads(cleaned_result)
            except Exception:
                parsed_result = {
                    "response_code": "200",
                    "content": cleaned_result,
                    "module_reference": None,
                    "related_transactions": [],
                    "suggested_reports": []
                }

            return jsonify({
                "response": parsed_result,
                "source_docs": [],
                "transcription": {"text": transcription_text}
            })

        doc_contents = [clean_text_content(doc.page_content) for doc in docs]
        doc_sources = [doc.metadata.get('source', 'Unknown') if doc.metadata else 'Unknown' for doc in docs]

        formatted_docs = '\n\n'.join(doc_contents)

        enhanced_prompt = f"""
Based on the following information from our knowledge base:
{'-' * 30}
{formatted_docs}
{'-' * 30}

Please answer the user's query from speech: "{transcription_text}"

Use only the information provided above to answer the query. If the information is not sufficient 
to provide a complete answer, please state what is known from the provided context and indicate 
what information is missing.
"""

        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
        )
        result = model.invoke(enhanced_prompt).content
        cleaned_result = clean_text_content(str(result))

        try:
            result_json = json.loads(cleaned_result)
        except Exception:
            result_json = {
                "response_code": "200",
                "content": cleaned_result,
                "module_reference": None,
                "related_transactions": [],
                "suggested_reports": []
            }

        clean_doc_contents = [clean_text_content(doc.page_content) for doc in docs]

        response_data = {
            "response": result_json,
            "source_docs": [
                {"content": clean_doc_contents[i], "source": doc_sources[i]} for i in range(len(clean_doc_contents))
            ],
            "transcription": {"text": transcription_text}
        }

        return jsonify(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "response": {
                "response_code": "500",
                "content": f"An error occurred processing the audio: {str(e)}",
                "module_reference": None,
                "related_transactions": [],
                "suggested_reports": []
            },
            "source_docs": [],
            "transcription": {"error": str(e)}
        }), 500
        
if __name__ == "__main__":
    app.run(debug=True)
      
    