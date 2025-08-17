from flask import Flask, request, jsonify, render_template
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import random
import os

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "qa.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    QA = json.load(f)

QUESTIONS = list(QA.keys())
VECTORIZER = TfidfVectorizer()
QUESTION_VECS = VECTORIZER.fit_transform(QUESTIONS)

def best_answer(user_text, threshold=0.15):
    vec = VECTORIZER.transform([user_text])
    sims = cosine_similarity(vec, QUESTION_VECS)[0]
    idx = int(np.argmax(sims))
    score = sims[idx]

    if score < threshold:
        return {
            "answer": "I’m not fully sure about that. Try asking about schedule, venue, registration, fees, or speakers.",
            "matched_question": None,
            "similarity": float(score)
        }

    q = QUESTIONS[idx]
    ans = random.choice(QA[q])
    return {"answer": ans, "matched_question": q, "similarity": float(score)}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Empty message"}), 400
    result = best_answer(message)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
