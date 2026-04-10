from fastapi import FastAPI, UploadFile, File
from typing import List
from datetime import datetime
from pymongo import MongoClient
from ai_engine import calculate_similarity

app = FastAPI()

client = MongoClient("mongodb://localhost:27017/")
db = client["ai_project_db"]
history_collection = db["check_history"]

@app.post("/check-students")
async def check_students(
    master_file: UploadFile = File(...),      
    other_files: List[UploadFile] = File(...)
):
    master_content = (await master_file.read()).decode("utf-8")

    others_content = []
    filenames = []
    for file in other_files:
        content = (await file.read()).decode("utf-8")
        others_content.append(content)
        filenames.append(file.filename)

    report = calculate_similarity(master_content, others_content, filenames)

    history_data = {
        "check_time": datetime.now(),
        "master_filename": master_file.filename,
        "results": report 
    }
    history_collection.insert_one(history_data)

    return {
        "status": "success",
        "compared_with": master_file.filename,
        "results": report
    }