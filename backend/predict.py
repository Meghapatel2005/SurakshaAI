import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Saved model load karo
MODEL_PATH = "../model/scam_detector"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

model.eval()

text = input("Enter message: ")

inputs = tokenizer(
    text,
    return_tensors="pt",
    truncation=True,
    padding=True,
    max_length=64
)

with torch.no_grad():
    outputs = model(**inputs)

probabilities = torch.softmax(outputs.logits, dim=1)
prediction = torch.argmax(probabilities, dim=1).item()
confidence = probabilities[0][prediction].item() * 100

label = "SCAM" if prediction == 1 else "SAFE"

print(f"\nPrediction : {label}")
print(f"Confidence : {confidence:.2f}%")