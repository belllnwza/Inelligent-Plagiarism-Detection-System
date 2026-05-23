from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
from typing import List
from datetime import datetime
from pymongo import MongoClient

import os

from ai_engine import calculate_similarity

app = FastAPI()

# Enable CORS for local testing from browser file:/// URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB with local memory fallback
mongo_available = True
db_fallback = []
users_fallback = []  # In-memory user storage fallback

try:
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    db = client["ai_project_db"]
    history_collection = db["check_history"]
    users_collection = db["users"]
    # Test connection
    client.server_info()
    print("MongoDB connected successfully.")
except Exception as e:
    print(f"MongoDB connection failed. Using in-memory fallback database. Error: {e}")
    mongo_available = False

# --- Helper: No hashing - store plain text for simplicity ---
def hash_password(password: str) -> str:
    return password  # Plain text

# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class ResetPasswordRequest(BaseModel):
    username: str
    new_password: str

# Post API for checking student answers
@app.post("/check-students")
async def check_students(
    master_file: UploadFile = File(...),      
    other_files: List[UploadFile] = File(...)
):
    try:
        master_content = (await master_file.read()).decode("utf-8")
    except Exception as e:
        return {"status": "error", "message": f"Failed to read master file: {str(e)}"}

    others_content = []
    filenames = []
    for file in other_files:
        try:
            content = (await file.read()).decode("utf-8")
            others_content.append(content)
            filenames.append(file.filename)
        except Exception as e:
            print(f"Failed to read file {file.filename}: {e}")

    if not others_content:
        return {"status": "error", "message": "No valid student files were uploaded."}

    # Call ML classifier and similarity matching
    report = calculate_similarity(master_content, others_content, filenames)

    history_data = {
        "check_time": datetime.now(),
        "master_filename": master_file.filename,
        "results": report 
    }

    # Save to database or memory
    if mongo_available:
        try:
            history_collection.insert_one(history_data.copy())
        except Exception as e:
            print(f"Failed to insert into MongoDB: {e}")
            db_fallback.append(history_data)
    else:
        db_fallback.append(history_data)

    return {
        "status": "success",
        "compared_with": master_file.filename,
        "results": report
    }

# Get API for fetching past check histories
@app.get("/api/history")
async def get_history():
    records = []
    if mongo_available:
        try:
            cursor = history_collection.find().sort("check_time", -1).limit(50)
            records = list(cursor)
        except Exception as e:
            print(f"Failed to query MongoDB history: {e}")
            records = db_fallback
    else:
        records = db_fallback

    formatted_records = []
    for r in records:
        # Convert datetime to string format
        check_time_str = ""
        if "check_time" in r:
            if isinstance(r["check_time"], datetime):
                check_time_str = r["check_time"].strftime("%d/%m/%Y %H:%M:%S")
            else:
                check_time_str = str(r["check_time"])
        
        # Handle BSON ObjectIds
        item_id = str(r.get("_id", hash(check_time_str)))
        
        formatted_records.append({
            "id": item_id,
            "date": check_time_str,
            "name": r.get("master_filename", "Unknown Master File"),
            "results": r.get("results", [])
        })
    return formatted_records

# --- AUTH: Register new user ---
@app.post("/api/register")
async def register(req: RegisterRequest):
    username = req.username.strip()
    password = req.password.strip()

    if not username or not password:
        return {"status": "error", "message": "Username and password are required."}

    hashed = hash_password(password)

    if mongo_available:
        try:
            existing = users_collection.find_one({"username": username})
            if existing:
                return {"status": "error", "message": "Username already exists."}
            users_collection.insert_one({"username": username, "password": hashed})
            return {"status": "success", "message": "Registration successful."}
        except Exception as e:
            print(f"MongoDB register error: {e}")

    # Fallback: in-memory
    for u in users_fallback:
        if u["username"] == username:
            return {"status": "error", "message": "Username already exists."}
    users_fallback.append({"username": username, "password": hashed})
    return {"status": "success", "message": "Registration successful (in-memory)."}

# --- AUTH: Login ---
@app.post("/api/login")
async def login(req: LoginRequest):
    username = req.username.strip()
    password = req.password.strip()

    if not username or not password:
        return {"status": "error", "message": "Username and password are required."}

    hashed = hash_password(password)

    if mongo_available:
        try:
            user = users_collection.find_one({"username": username, "password": hashed})
            if user:
                return {"status": "success", "message": "Login successful.", "username": username}
            else:
                return {"status": "error", "message": "Invalid username or password."}
        except Exception as e:
            print(f"MongoDB login error: {e}")

    # Fallback: in-memory
    for u in users_fallback:
        if u["username"] == username and u["password"] == hashed:
            return {"status": "success", "message": "Login successful.", "username": username}
    return {"status": "error", "message": "Invalid username or password."}

# --- AUTH: Reset Password ---
@app.post("/api/reset-password")
async def reset_password(req: ResetPasswordRequest):
    username = req.username.strip()
    new_password = req.new_password.strip()

    if not username or not new_password:
        return {"status": "error", "message": "Username and new password are required."}

    hashed = hash_password(new_password)

    if mongo_available:
        try:
            result = users_collection.update_one(
                {"username": username},
                {"$set": {"password": hashed}}
            )
            if result.matched_count > 0:
                return {"status": "success", "message": "Password reset successful."}
            else:
                return {"status": "error", "message": "Username not found."}
        except Exception as e:
            print(f"MongoDB reset-password error: {e}")

    # Fallback: in-memory
    for u in users_fallback:
        if u["username"] == username:
            u["password"] = hashed
            return {"status": "success", "message": "Password reset successful (in-memory)."}
    return {"status": "error", "message": "Username not found."}

# Mount and serve static files to align with original relative paths (../CSS/style1.css etc.)
app.mount("/CSS", StaticFiles(directory="CSS"), name="css")
app.mount("/JS", StaticFiles(directory="JS"), name="js")
app.mount("/Img", StaticFiles(directory="Img"), name="img")
app.mount("/HTML", StaticFiles(directory="HTML"), name="html")

@app.get("/")
async def read_root():
    return RedirectResponse(url="/HTML/login1.html")