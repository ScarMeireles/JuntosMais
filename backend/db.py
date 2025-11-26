from databases import Database
from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL")

database = Database(DATABASE_URL)

Base = declarative_base()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False 
)

metadata = Base.metadata