from databases import Database
from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "postgresql+psycopg2://juntos_mais_user:EPZ4r8ULpWXRaxS22joMpt1tJJilWg89@dpg-d4c0lt0gjchc73d2cvf0-a.oregon-postgres.render.com/juntos_mais" 

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