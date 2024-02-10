import logging
import sys

# Uncomment to see debug logs
# logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
# logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

from llama_index.storage import StorageContext
from llama_index.readers.web import SimpleWebPageReader
from llama_index.indices.vector_store import VectorStoreIndex
from llama_index.vector_stores import SupabaseVectorStore
import textwrap
import html2text

import os
os.environ['OPENAI_API_KEY'] = "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"

essays = [
    'paul_graham_essay.txt'
]
documents = SimpleWebPageReader().load_data([f'https://raw.githubusercontent.com/supabase/supabase/master/examples/ai/llamaindex/data/{essay}' for essay in essays])
print('Document ID:', documents[0].doc_id, 'Document Hash:', documents[0].hash)


# Substitute your connection string here
DB_CONNECTION = "postgresql://postgres.nibfafwhlabdjvkzpvuv:JarvisDB$$##!!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

vector_store = SupabaseVectorStore(
    postgres_connection_string=DB_CONNECTION,
    collection_name='base_demo'
)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)

query_engine = index.as_query_engine()

# Ask a question
response = query_engine.query("What is a summary of the article")

# Print the response
print(response)