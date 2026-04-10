from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_similarity(master_text, other_texts_list, filenames):
    all_content = [master_text] + other_texts_list
    
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_content)
    
    similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
    
    results = []
    for i in range(len(other_texts_list)):
        results.append({
            "student_file": filenames[i],
            "similarity_percent": round(float(similarity_scores[i]) * 100, 2)
        })
    
    return sorted(results, key=lambda x: x['similarity_percent'], reverse=True)