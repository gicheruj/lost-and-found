import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/lostfound')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_secret_key')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 5242880))
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}