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
import chromadb
from chromadb.config import Settings
import shutil
from create_knoweldge_base import create_knowledge_base_fn
from fetch_from_knoweldge_base import fetch_from_knowledge_base
import json


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
        # First fetch relevant documents from the knowledge base
        docs = fetch_from_knowledge_base(user_input)
        
        if not docs or len(docs) == 0:
            # If no relevant documents are found, just use the regular model
            model = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                api_key=SecretStr(GOOGLE_GEMINI_API_KEY) if GOOGLE_GEMINI_API_KEY else None
            )
            full_prompt = f"{MY_PROMPT}\n\nUser Query: {user_input}\n\nProvide a response in the JSON format specified above."
            result = model.invoke(full_prompt).content
            cleaned_result = clean_text_content(str(result))
            # Attempt to parse result as JSON; otherwise, wrap it in our response format.
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
        
        # Extract the content from the documents and clean them
        doc_contents = [clean_text_content(doc.page_content) for doc in docs]
        doc_sources = [doc.metadata.get('source', 'Unknown') if doc.metadata else 'Unknown' for doc in docs]
        
        # Format document contents for better readability in the prompt
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
            
        # Clean the source document contents for display
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
    cleaned = text.replace('\\n', ' ').replace('\\t', ' ')
    leaned = re.sub(r'\*\*|\*', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'(?<!\\)"', '\\"', cleaned) 
    return cleaned.strip()

if __name__ == "__main__":
    app.run(debug=True)
    
    