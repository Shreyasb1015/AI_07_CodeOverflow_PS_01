import os
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

def create_knowledge_base_fn():
    try:
        load_dotenv()
        GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
        
        if not GOOGLE_GEMINI_API_KEY:
            print("Error: GOOGLE_GEMINI_API_KEY not found in environment variables")
            return False
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "db", "hack-faq.pdf")
        persistent_directory = os.path.join(current_dir, "db", "chroma_db")
        
        if not os.path.exists(persistent_directory):
            print("Persistent directory does not exist. Initializing vector store...")
            if not os.path.exists(file_path):
                raise FileNotFoundError(
                    f"The file {file_path} does not exist. Please check the path."
                )
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
            docs = text_splitter.split_documents(documents)
            
            print("\n--- Document Chunks Information ---")
            print(f"Number of document chunks: {len(docs)}")
            print("\n--- Creating embeddings ---")
            embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_GEMINI_API_KEY,credentials=None)   # type: ignore
            print("\n--- Finished creating embeddings ---")
            
            print("\n--- Creating vector store ---")
            db = Chroma.from_documents(
                docs, embeddings, persist_directory=persistent_directory)
            print("\n--- Finished creating vector store ---")
            
        else:
            print("Vector store already exists. No need to initialize.")
        
        return True
        
    except Exception as e:
        print(f"Error creating knowledge base: {str(e)}")
        return False

