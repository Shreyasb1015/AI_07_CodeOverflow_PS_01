import re
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import SecretStr
from PIL import Image
import pytesseract
import io


app = Flask(__name__)
CORS(app,supports_credentials=True)
load_dotenv()
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

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

pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

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
    

    
if __name__ == "__main__":
    app.run(debug=True)
    
    