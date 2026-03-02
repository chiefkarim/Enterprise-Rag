# Low-Budget RAG Pipeline for Small Companies

This repository contains the Python implementation of a Retrieval Augmented Generation (RAG) pipeline designed for low-budget scenarios, as detailed in the accompanying blog post. It leverages `llama_index` with efficient tools like `FastEmbedEmbedding` for embeddings, `SentenceTransformerRerank` for re-ranking, and `Ollama` for local language model interaction.

## Blog Post

This project is an implementation of the concepts discussed in the Medium blog post: [Low-Budget RAG pipeline for your small company](https://mennakarim.medium.com/low-budget-rag-pipeline-for-your-small-company-43e9c30cf502).

---

## Project Overview

This project implements a Retrieval Augmented Generation (RAG) system using `llama_index`. It enables users to embed documents from a specified directory, build a vector store index, and then perform queries against this index. The system leverages `FastEmbedEmbedding` for efficient embeddings, `SentenceTransformerRerank` for re-ranking retrieved nodes, and `Ollama` for interacting with a local language model.

## Building and Running

### Setup

1.  **Install Dependencies**: This project uses Python and relies on `llama_index` and other related libraries. A `requirements.txt` file is not provided, but the key libraries observed are `llama_index` (with integrations for `FastEmbedEmbedding` and `Ollama`) and `numpy`.
2.  **Ollama**: Ensure Ollama is installed and running, as the `rag.py` and `retriever.py` scripts are configured to use an Ollama instance at `127.0.0.1:11434`. You may also need to pull the `qwen3:0.6b` model used in `rag.py` and `retriever.py`.

### Indexing Data

The `embed.py` script processes documents from the `./test_data/` directory and creates a persistent vector store index in the `./indexed-data/` directory.

```bash
python embed.py
```

### Running Queries

- **Full RAG Pipeline (Query LLM)**: The `rag.py` script executes a full RAG pipeline, retrieving relevant information and then querying the configured LLM (Ollama).

  ```bash
  python rag.py
  ```

- **Document Retrieval**: The `query.py` script demonstrates how to retrieve relevant documents based on a query. The results are saved to `tmp_result.json`.

  ```bash
  python query.py
  ```

- **Retrieval with Reranking**: The `retriever.py` script demonstrates document retrieval followed by re-ranking using a `SentenceTransformerRerank` model. The re-ranked results are saved to `tmp_reranked.json`.

  ```bash
  python retriever.py
  ```

## Development Conventions

- **Framework**: The project heavily utilizes the `llama_index` framework for RAG functionalities.
- **Data Storage**: Indexed data (vector store) is persisted in the `./indexed-data/` directory.
- **Test Data**: Raw documents for indexing are expected to be placed in the `./test_data/` directory.
- **JSON Output**: Helper functions in `utils.py` are used for serializing and dumping Python objects to JSON files, primarily for inspecting retrieval and re-ranking results.
