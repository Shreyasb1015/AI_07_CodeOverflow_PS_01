import os
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

def fetch_from_knowledge_base(query, k=3, score_threshold=0.4):
    
    try:
        
        load_dotenv()
        GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
        
        if not GOOGLE_GEMINI_API_KEY:
            print("Error: GOOGLE_GEMINI_API_KEY not found in environment variables")
            return None
    
        current_dir = os.path.dirname(os.path.abspath(__file__))
        persistent_directory = os.path.join(current_dir, "db", "chroma_db")
        if not os.path.exists(persistent_directory):
            print(f"Error: Vector store not found at {persistent_directory}")
            return None
        

        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=GOOGLE_GEMINI_API_KEY, # type: ignore
            credentials=None
        )
        db = Chroma(
            persist_directory=persistent_directory,
            embedding_function=embeddings
        )
        
        retriever = db.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"k": k, "score_threshold": score_threshold}
        )
        
        relevant_docs = retriever.invoke(query)
        
        if not relevant_docs:
            print("No relevant documents found for the query.")
            return []
        
        print("\n--- Relevant Documents ---")
        for i, doc in enumerate(relevant_docs, 1):
            print(f"Document {i}:\n{doc.page_content}\n")
            if doc.metadata:
                print(f"Source: {doc.metadata.get('source', 'Unknown')}\n")
        
        return relevant_docs
        
    except Exception as e:
        print(f"Error fetching from knowledge base: {str(e)}")
        return None


