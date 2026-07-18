import os
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

class RAGEngine:
    def __init__(self, knowledge_base_dir: str = "data/knowledge_base", model_name: str = "all-MiniLM-L6-v2"):
        """
        Initializes the RAG Engine by loading documents, creating embeddings, 
        and building a FAISS vector index.
        """
        # Resolve path relative to this script
        base_dir = Path(__file__).parent.parent
        self.kb_dir = base_dir / "knowledge_base"
        
        print(f"Initializing RAGEngine with knowledge base at: {self.kb_dir}")
        
        if not self.kb_dir.exists():
            print(f"Warning: Knowledge base directory {self.kb_dir} does not exist.")
            self.vector_store = None
            return

        # 1. Load documents
        loader = DirectoryLoader(
            str(self.kb_dir), 
            glob="**/*.md", 
            loader_cls=TextLoader,
            loader_kwargs={'autodetect_encoding': True}
        )
        documents = loader.load()
        print(f"Loaded {len(documents)} documents.")
        
        if not documents:
            print("Warning: No markdown files found in the knowledge base.")
            self.vector_store = None
            return

        # 2. Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks.")

        # 3. Create embeddings model locally
        print(f"Loading embedding model: {model_name}...")
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)

        # 4. Build or load FAISS vector store
        faiss_path = self.kb_dir / "faiss_index"
        if faiss_path.exists():
            print("Loading existing FAISS vector index from disk...")
            self.vector_store = FAISS.load_local(str(faiss_path), self.embeddings, allow_dangerous_deserialization=True)
        else:
            print("Building FAISS vector index from scratch...")
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
            self.vector_store.save_local(str(faiss_path))
            print("Saved FAISS index to disk for fast future startups.")
            
        print("RAGEngine initialization complete.")

    def retrieve(self, query: str, top_k: int = 3) -> list:
        """
        Retrieves the top_k most relevant document chunks for the given query.
        Returns a list of dicts containing the content, source file, and confidence score.
        """
        if not self.vector_store:
            print("Vector store not initialized. Cannot retrieve.")
            return []
            
        # Perform similarity search with score
        # Note: FAISS returns L2 distance by default (lower is better).
        docs_and_scores = self.vector_store.similarity_search_with_score(query, k=top_k)
        
        results = []
        for doc, score in docs_and_scores:
            # Convert L2 distance to a pseudo-confidence score between 0 and 1
            # (Very rough approximation: e^(-score))
            import math
            confidence = math.exp(-score) if score > 0 else 1.0
            
            source_file = Path(doc.metadata.get("source", "")).name
            
            results.append({
                "content": doc.page_content,
                "source_title": source_file.replace(".md", "").replace("_", " ").title(),
                "source_file": source_file,
                "confidence": min(0.95, round(confidence, 2)) # Cap at 0.95 to look realistic
            })
            
        return results

# Singleton instance to be used across the app
_rag_engine_instance = None

def get_rag_engine():
    global _rag_engine_instance
    if _rag_engine_instance is None:
        _rag_engine_instance = RAGEngine()
    return _rag_engine_instance
