from llama_index.indices.struct_store.sql_query import NLSQLTableQueryEngine
from llama_index import SQLDatabase
from llama_index.llms import OpenAI
from sqlalchemy import create_engine

import os
os.environ['OPENAI_API_KEY'] = "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"

db_uri = "postgresql://postgres.nibfafwhlabdjvkzpvuv:JarvisDB$$##!!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

llm = OpenAI(temperature=0.0, model="gpt-3.5-turbo")
db_engine = create_engine(db_uri)
sql_db = SQLDatabase(db_engine)
query_engine = NLSQLTableQueryEngine(sql_database=sql_db)

query_str = "how many emails are there"
response = query_engine.query(query_str)

print(response)

