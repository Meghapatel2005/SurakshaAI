from data import SCAM_KEYWORDS
from url_detector import detect_fake_url

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# AI Model Load
MODEL_PATH = "../model/scam_detector"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()


def detect_scam(message):

    msg = message.lower()

    score = 0
    found = []

    # Keyword Detection
    for word in SCAM_KEYWORDS:
        if word in msg:
            score += 10
            found.append(word)

    # URL Detection
    fake_urls = detect_fake_url(message)

    if fake_urls:
        score += 40

    # AI Prediction
    inputs = tokenizer(
        message,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=64
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.softmax(outputs.logits, dim=1)
    prediction = torch.argmax(probs, dim=1).item()
    confidence = probs[0][prediction].item() * 100

    ai_result = "SCAM" if prediction == 1 else "SAFE"

    # Final Result
    if score >= 30 or ai_result == "SCAM":
        result = "⚠ Scam Suspected"
    else:
        result = "✅ Looks Safe"

    return {
        "Result": result,
        "AI Prediction": ai_result,
        "Confidence": round(confidence, 2),
        "Risk Score": score,
        "Matched Keywords": found,
        "Suspicious URLs": fake_urls
    }