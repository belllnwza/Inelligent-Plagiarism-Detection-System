from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
import json
import os

def get_jaccard_sim(str1, str2):
    a = set(str1.lower().split())
    b = set(str2.lower().split())
    if not a and not b:
        return 1.0
    c = a.intersection(b)
    return float(len(c)) / (len(a) + len(b) - len(c))

def get_features(text_a, text_b, vectorizer=None):
    try:
        # หากมีการส่ง vectorizer หลักเข้ามา ให้ใช้ตัวหลัก (ไม่งั้นค่า IDF จะเพี้ยน)
        if vectorizer is not None:
            tfidf = vectorizer.transform([text_a, text_b])
        else:
            # Fallback หากไม่มีการส่งมา (เช่น ตอนรันเทสเดี่ยวๆ)
            local_vectorizer = TfidfVectorizer(stop_words='english').fit([text_a, text_b])
            tfidf = local_vectorizer.transform([text_a, text_b])
            
        cos_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    except Exception:
        cos_sim = 0.0

    jaccard = get_jaccard_sim(text_a, text_b)
    
    words_a = len(text_a.split())
    words_b = len(text_b.split())
    max_words = max(words_a, words_b, 1)
    len_ratio = min(words_a, words_b) / max_words
    
    return [cos_sim, jaccard, len_ratio]

def train_classifier():
    # โหลด training data จากไฟล์ภายนอก training_data.json
    # ต้องการเพิ่มข้อมูล ให้แก้ที่ไฟล์ training_data.json ได้เลย ไม่ต้องแก้โค้ดนี้
    data_path = os.path.join(os.path.dirname(__file__), "training_data.json")
    with open(data_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    # y=2: High Match, y=1: Partial Match, y=0: Low Match
    training_data = [(d["text_a"], d["text_b"], d["label"]) for d in raw]
    
    # Fit the vectorizer on all texts in training data
    all_texts = []
    for t_a, t_b, _ in training_data:
        all_texts.extend([t_a, t_b])
        
    # ใส่แค่ stop_words เพื่อกรองคำโหลภาษาอังกฤษออกอย่างปลอดภัย ไม่ให้ฟีเจอร์หาย
    vectorizer = TfidfVectorizer(stop_words='english').fit(all_texts)
    X = []
    y = []
    for t_a, t_b, label in training_data:
        features = get_features(t_a, t_b, vectorizer)
        X.append(features)
        y.append(label)
        
    clf = RandomForestClassifier(n_estimators=20, random_state=42)
    clf.fit(X, y)
    
    return clf, vectorizer

# Train model and fit vectorizer once on startup
clf, vectorizer = train_classifier()

def calculate_similarity(master_text, other_texts_list, filenames):
    results = []
    for i, other_text in enumerate(other_texts_list):
        features = get_features(master_text, other_text, vectorizer)
        
        # 1. ให้ Random Forest ทำนายคลาสโดยตรง (0=Low Match, 1=Partial Match, 2=High Match)
        predicted_class = int(clf.predict([features])[0])
        
        # 2. ดึงค่าความน่าจะเป็น (Probability) ของคลาสที่โมเดลเลือกจริง ๆ มาเป็นค่าความมั่นใจ (Confidence)
        probs = clf.predict_proba([features])[0]
        confidence = round(float(probs[predicted_class]) * 100, 2)
        
        # 3. คำนวณค่าเปอร์เซ็นต์ Cosine Similarity ดิบเพื่อนำไปแสดงผลบน UI
        cos_sim_percent = round(features[0] * 100, 2)
        
        # Map คลาสตัวเลขไปเป็นข้อความแสดงสถานะ
        class_mapping = {0: "Low Match", 1: "Partial Match", 2: "High Match"}
        status = class_mapping[predicted_class]
        
        results.append({
            "student_file": filenames[i],
            "similarity_percent": cos_sim_percent,
            "status": status,
            "confidence": confidence,
            "class_id": predicted_class
        })
        
    # เรียงลำดับผลลัพธ์ตามเปอร์เซ็นต์ความคล้ายคลึงจากมากไปน้อย (Descending)
    return sorted(results, key=lambda x: x['similarity_percent'], reverse=True)