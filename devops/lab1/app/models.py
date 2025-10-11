from sqlalchemy import Column, Integer, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class Counter(Base):
    __tablename__ = 'counters'
    
    id = Column(Integer, primary_key=True)
    value = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_database_url():
    db_host = os.getenv('DB_HOST', 'db')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'counterdb')
    db_user = os.getenv('DB_USER', 'counteruser')
    db_password = os.getenv('DB_PASSWORD', 'counterpass')
    
    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

def get_engine():
    database_url = get_database_url()
    return create_engine(database_url)

def get_session():
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()

def init_db():
    engine = get_engine()
    Base.metadata.create_all(engine)
    
    session = get_session()
    try:
        counter = session.query(Counter).first()
        if not counter:
            counter = Counter(value=0)
            session.add(counter)
            session.commit()
    finally:
        session.close()
