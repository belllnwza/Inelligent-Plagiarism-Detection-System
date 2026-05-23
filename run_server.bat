@echo off
echo Starting Plagiarism Checker Web App on port 8080...
uvicorn main:app --reload --port 8080
pause
