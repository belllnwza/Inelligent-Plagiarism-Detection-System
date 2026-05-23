from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier

def get_jaccard_sim(str1, str2):
    a = set(str1.lower().split())
    b = set(str2.lower().split())
    if not a and not b:
        return 1.0
    c = a.intersection(b)
    return float(len(c)) / (len(a) + len(b) - len(c))

def get_features(text_a, text_b, vectorizer=None):
    try:
        # Fit vectorizer dynamically on the two texts to capture all vocabulary words
        local_vectorizer = TfidfVectorizer().fit([text_a, text_b])
        tfidf = local_vectorizer.transform([text_a, text_b])
        cos_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    except Exception:
        # Fallback if text is empty or has no words
        cos_sim = 0.0

    jaccard = get_jaccard_sim(text_a, text_b)
    
    words_a = len(text_a.split())
    words_b = len(text_b.split())
    max_words = max(words_a, words_b, 1)
    len_ratio = min(words_a, words_b) / max_words
    
    return [cos_sim, jaccard, len_ratio]

def train_classifier():
    # A set of synthetic training pairs (master_text, student_text, label)
    # y=2: High Match, y=1: Partial Match, y=0: Low Match
    training_data = [
        # --- Class 2: High Match / Correct (Green) ---
        ("Artificial intelligence is the simulation of human intelligence by machines.",
         "Artificial intelligence is the simulation of human intelligence by machines.", 2),
        ("Python is a high-level general-purpose programming language designed by Guido van Rossum.",
         "Python is a high-level general-purpose programming language designed by Guido van Rossum.", 2),
        ("Machine learning is a subfield of artificial intelligence that focuses on data.",
         "Machine learning is a subfield of artificial intelligence that focuses on data.", 2),
        ("Data science combines math, statistics, specialized programming, and analytics.",
         "Data science combines mathematics, statistics, programming, and advanced analytics.", 2),
        ("The quick brown fox jumps over the lazy dog.",
         "The quick brown fox jumps over the lazy dog.", 2),
        
        # --- Class 1: Partial Match / Medium (Yellow) ---
        ("Artificial intelligence is the simulation of human intelligence by machines.",
         "AI is simulation of intelligence in machines using computer systems.", 1),
        ("Python is a high-level general-purpose programming language designed by Guido van Rossum.",
         "Python is a programming language developed by Guido van Rossum for general purposes.", 1),
        ("Machine learning is a subfield of artificial intelligence that focuses on data.",
         "Machine learning is a branch of AI focusing on data models.", 1),
        ("Data science combines math, statistics, specialized programming, and analytics.",
         "Data science uses mathematics and statistics for analytics and programming.", 1),
        ("The quick brown fox jumps over the lazy dog.",
         "A fast brown fox jumped over a sleepy dog.", 1),
        
        # --- Class 0: Low Match / Incorrect (Red) ---
        ("Artificial intelligence is the simulation of human intelligence by machines.",
         "The quick brown fox jumps over the lazy dog in the middle of the forest.", 0),
        ("Python is a high-level general-purpose programming language designed by Guido van Rossum.",
         "Web development involves designing websites and applications for the internet.", 0),
        ("Machine learning is a subfield of artificial intelligence that focuses on data.",
         "Cooking requires fresh ingredients, precise measurements, and proper heat control.", 0),
        ("Data science combines math, statistics, specialized programming, and analytics.",
         "Aerospace engineering is the primary field of engineering concerned with development of aircraft.", 0),
        ("The quick brown fox jumps over the lazy dog.",
         "I love eating apple pie and vanilla ice cream for dessert.", 0)
    ]
    
    # Fit the vectorizer on all texts in training data
    all_texts = []
    for t_a, t_b, _ in training_data:
        all_texts.extend([t_a, t_b])
        
    vectorizer = TfidfVectorizer().fit(all_texts)
    
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