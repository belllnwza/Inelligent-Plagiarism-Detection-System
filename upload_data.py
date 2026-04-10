from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["ai_project_db"]
collection = db["reference_docs"]

def seed_data():
    data = [
        {"filename": "doc1.txt", "content": "Artificial intelligence is the simulation of human intelligence by machines."},
        {"filename": "doc2.txt", "content": "Machine learning is a subfield of artificial intelligence that focuses on data."},
        {"filename": "doc3.txt", "content": "The quick brown fox jumps over the lazy dog."}
    ]
    
    collection.delete_many({}) 
    collection.insert_many(data)
    print("สำเร็จ! ข้อมูลถูกส่งไปที่ MongoDB แล้ว")

if __name__ == "__main__":
    seed_data()