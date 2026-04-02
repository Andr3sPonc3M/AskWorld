from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import os
import logging
from pathlib import Path
import bcrypt
import jwt
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserBase(BaseModel):
    email: EmailStr
    username: str
    native_language: str = "es"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class QuestionBase(BaseModel):
    title: str
    content: str
    category: str

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: str
    user_id: str
    username: str
    original_language: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    votes: int = 0
    views: int = 0
    answer_count: int = 0

class AnswerBase(BaseModel):
    content: str

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: str
    question_id: str
    user_id: str
    username: str
    original_language: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    votes: int = 0

class VoteCreate(BaseModel):
    target_id: str
    target_type: str  # 'question' or 'answer'
    vote_type: int  # 1 for upvote, -1 for downvote

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str

class CategoryCount(BaseModel):
    category: str
    count: int

# ============ UTILITIES ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def translate_text(text: str, target_lang: str, source_lang: str = "auto") -> str:
    """Translate text using LibreTranslate public API"""
    try:
        # Using public LibreTranslate instance
        url = "https://libretranslate.com/translate"
        payload = {
            "q": text,
            "source": source_lang,
            "target": target_lang,
            "format": "text"
        }
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            return response.json().get("translatedText", text)
        return text
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text

def format_user(user: dict) -> User:
    return User(
        id=str(user["_id"]),
        email=user["email"],
        username=user["username"],
        native_language=user.get("native_language", "es"),
        avatar=user.get("avatar"),
        created_at=user.get("created_at", datetime.utcnow())
    )

def format_question(question: dict) -> Question:
    return Question(
        id=str(question["_id"]),
        user_id=str(question["user_id"]),
        username=question["username"],
        title=question["title"],
        content=question["content"],
        category=question["category"],
        original_language=question.get("original_language", "es"),
        created_at=question.get("created_at", datetime.utcnow()),
        votes=question.get("votes", 0),
        views=question.get("views", 0),
        answer_count=question.get("answer_count", 0)
    )

def format_answer(answer: dict) -> Answer:
    return Answer(
        id=str(answer["_id"]),
        question_id=str(answer["question_id"]),
        user_id=str(answer["user_id"]),
        username=answer["username"],
        content=answer["content"],
        original_language=answer.get("original_language", "es"),
        created_at=answer.get("created_at", datetime.utcnow()),
        votes=answer.get("votes", 0)
    )

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "username": user_data.username,
        "password_hash": hash_password(user_data.password),
        "native_language": user_data.native_language,
        "created_at": datetime.utcnow(),
        "avatar": None
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    # Create token
    token = create_access_token({"sub": str(result.inserted_id)})
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user(user_dict)
    )

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(user["_id"])})
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user(user)
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return format_user(current_user)

# ============ QUESTION ENDPOINTS ============

@api_router.get("/questions", response_model=List[Question])
async def get_questions(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    sort: str = "recent"  # recent, popular, votes
):
    query = {}
    if category:
        query["category"] = category
    
    # Sort options
    sort_options = {
        "recent": [("created_at", -1)],
        "popular": [("views", -1)],
        "votes": [("votes", -1)]
    }
    sort_by = sort_options.get(sort, [("created_at", -1)])
    
    questions = await db.questions.find(query).sort(sort_by).skip(skip).limit(limit).to_list(limit)
    
    return [format_question(q) for q in questions]

@api_router.get("/questions/{question_id}", response_model=Question)
async def get_question(question_id: str):
    try:
        question = await db.questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Increment views
        await db.questions.update_one(
            {"_id": ObjectId(question_id)},
            {"$inc": {"views": 1}}
        )
        question["views"] = question.get("views", 0) + 1
        
        return format_question(question)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/questions", response_model=Question)
async def create_question(
    question_data: QuestionCreate,
    current_user: dict = Depends(get_current_user)
):
    question_dict = {
        "user_id": current_user["_id"],
        "username": current_user["username"],
        "title": question_data.title,
        "content": question_data.content,
        "category": question_data.category,
        "original_language": current_user.get("native_language", "es"),
        "created_at": datetime.utcnow(),
        "votes": 0,
        "views": 0,
        "answer_count": 0
    }
    
    result = await db.questions.insert_one(question_dict)
    question_dict["_id"] = result.inserted_id
    
    return format_question(question_dict)

@api_router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        question = await db.questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        if str(question["user_id"]) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized to delete this question")
        
        await db.questions.delete_one({"_id": ObjectId(question_id)})
        await db.answers.delete_many({"question_id": ObjectId(question_id)})
        
        return {"message": "Question deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/questions/search/query")
async def search_questions(
    q: str,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}}
        ]
    }
    
    if category:
        query["category"] = category
    
    questions = await db.questions.find(query).sort([("created_at", -1)]).skip(skip).limit(limit).to_list(limit)
    
    return [format_question(q) for q in questions]

# ============ ANSWER ENDPOINTS ============

@api_router.get("/questions/{question_id}/answers", response_model=List[Answer])
async def get_answers(question_id: str):
    try:
        answers = await db.answers.find(
            {"question_id": ObjectId(question_id)}
        ).sort([("votes", -1), ("created_at", -1)]).to_list(100)
        
        return [format_answer(a) for a in answers]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/questions/{question_id}/answers", response_model=Answer)
async def create_answer(
    question_id: str,
    answer_data: AnswerCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Check if question exists
        question = await db.questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        answer_dict = {
            "question_id": ObjectId(question_id),
            "user_id": current_user["_id"],
            "username": current_user["username"],
            "content": answer_data.content,
            "original_language": current_user.get("native_language", "es"),
            "created_at": datetime.utcnow(),
            "votes": 0
        }
        
        result = await db.answers.insert_one(answer_dict)
        answer_dict["_id"] = result.inserted_id
        
        # Update answer count
        await db.questions.update_one(
            {"_id": ObjectId(question_id)},
            {"$inc": {"answer_count": 1}}
        )
        
        return format_answer(answer_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/answers/{answer_id}")
async def delete_answer(
    answer_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        answer = await db.answers.find_one({"_id": ObjectId(answer_id)})
        if not answer:
            raise HTTPException(status_code=404, detail="Answer not found")
        
        if str(answer["user_id"]) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized to delete this answer")
        
        # Decrease answer count
        await db.questions.update_one(
            {"_id": answer["question_id"]},
            {"$inc": {"answer_count": -1}}
        )
        
        await db.answers.delete_one({"_id": ObjectId(answer_id)})
        
        return {"message": "Answer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============ VOTE ENDPOINTS ============

@api_router.post("/votes")
async def vote(
    vote_data: VoteCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Check if vote already exists
        existing_vote = await db.votes.find_one({
            "user_id": current_user["_id"],
            "target_id": ObjectId(vote_data.target_id),
            "target_type": vote_data.target_type
        })
        
        collection = db.questions if vote_data.target_type == "question" else db.answers
        
        if existing_vote:
            # If same vote, remove it (toggle)
            if existing_vote["vote_type"] == vote_data.vote_type:
                await db.votes.delete_one({"_id": existing_vote["_id"]})
                await collection.update_one(
                    {"_id": ObjectId(vote_data.target_id)},
                    {"$inc": {"votes": -vote_data.vote_type}}
                )
                return {"message": "Vote removed", "action": "removed"}
            else:
                # Change vote
                await db.votes.update_one(
                    {"_id": existing_vote["_id"]},
                    {"$set": {"vote_type": vote_data.vote_type}}
                )
                # Update votes (remove old, add new = difference of 2)
                diff = vote_data.vote_type - existing_vote["vote_type"]
                await collection.update_one(
                    {"_id": ObjectId(vote_data.target_id)},
                    {"$inc": {"votes": diff}}
                )
                return {"message": "Vote updated", "action": "updated"}
        else:
            # New vote
            await db.votes.insert_one({
                "user_id": current_user["_id"],
                "target_id": ObjectId(vote_data.target_id),
                "target_type": vote_data.target_type,
                "vote_type": vote_data.vote_type,
                "created_at": datetime.utcnow()
            })
            await collection.update_one(
                {"_id": ObjectId(vote_data.target_id)},
                {"$inc": {"votes": vote_data.vote_type}}
            )
            return {"message": "Vote added", "action": "added"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/votes/user/{target_id}")
async def get_user_vote(
    target_id: str,
    target_type: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        vote = await db.votes.find_one({
            "user_id": current_user["_id"],
            "target_id": ObjectId(target_id),
            "target_type": target_type
        })
        
        if vote:
            return {"vote_type": vote["vote_type"]}
        return {"vote_type": 0}
    except Exception as e:
        return {"vote_type": 0}

# ============ TRANSLATION ENDPOINT ============

@api_router.post("/translate")
async def translate(request: TranslateRequest):
    translated = await translate_text(request.text, request.target_lang, request.source_lang)
    return {"translated_text": translated}

# ============ CATEGORIES ENDPOINT ============

@api_router.get("/categories", response_model=List[CategoryCount])
async def get_categories():
    categories = [
        "Tecnología y Programación",
        "Ciencia y Matemáticas",
        "Educación y Aprendizaje",
        "Salud y Bienestar",
        "Arte y Cultura",
        "Negocios y Emprendimiento",
        "Viajes y Geografía",
        "Idiomas",
        "Deportes y Fitness",
        "Vida Cotidiana"
    ]
    
    result = []
    for category in categories:
        count = await db.questions.count_documents({"category": category})
        result.append(CategoryCount(category=category, count=count))
    
    return result

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
